"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import ProjectCard from "@/components/ProjectCard";
import Toast from "@/components/Toast";
import AdminLogin from "@/components/AdminLogin";
import ProjectForm, { ProjectFormData } from "@/components/ProjectForm";
import Button from "@/components/Button";
import ErrorBoundary from "@/components/ErrorBoundary";
import { projects as defaultProjects } from "@/data/projects";
import { Project, AuthResponse, LoginResponse } from "@/types/project";
import { STORAGE_KEY } from "@/lib/constants";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SortableProjectCardProps = {
  project: Project;
  isAdmin: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  source?: 'local' | 'server' | 'default';
};

function SortableProjectCard({ project, isAdmin, onEdit, onDelete }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isAdmin && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing bg-slate-700/80 hover:bg-slate-600/80 backdrop-blur-sm rounded-lg p-2 border border-slate-600"
          title="Drag to reorder"
          role="button"
          aria-label="Drag to reorder project"
        >
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      )}
      <ProjectCard
        title={project.title}
        url={project.url}
        description={project.description}
        tags={project.tags}
        imageUrl={project.imageUrl}
        images={project.images}
        source={project.source}
      />
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => onEdit(project)}
            className="text-xs px-2 py-1 rounded bg-blue-500/30 hover:bg-blue-500/40 border border-blue-500/40"
            title="Edit local project"
            aria-label={`Edit ${project.title}`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="text-xs px-2 py-1 rounded bg-red-500/30 hover:bg-red-500/40 border border-red-500/40"
            title="Delete local project"
            aria-label={`Delete ${project.title}`}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

const MemoizedSortableProjectCard = React.memo(SortableProjectCard);

export default function ProjectsSection() {
  const [items, setItems] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" | "error" } | null>(null);
  const [importToServer, setImportToServer] = useState(false);

  const showToast = useCallback((message: string, type?: "success" | "info" | "error") => {
    setToast({ message, type });
  }, []);
  // No longer prompting for token; rely on admin session cookie

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check auth status on mount
  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then((data: AuthResponse) => {
        if (data.authenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, []);

  // Token no longer required for UI actions

  // Load projects on mount
  useEffect(() => {
    const defaults: Project[] = defaultProjects.map((p, i) => ({
      id: `default-${i}`,
      title: p.title,
      url: p.url,
      description: p.description,
      tags: p.tags,
      imageUrl: p.imageUrl || "",
      source: "default" as const,
    }));

    // Start with local projects for backward compatibility
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const local: Project[] = raw ? JSON.parse(raw) : [];
      setItems([...local, ...defaults]);
    } catch {
      setItems(defaults);
    }

    // Fetch server-side projects and merge on top
    fetch("/api/projects")
      .then((r) => r.json())
      .then((server: unknown) => {
        const serverArray = Array.isArray(server) ? server : [];
        const serverMapped: Project[] = serverArray.map((p: unknown, i) => {
          const proj = p as Record<string, unknown>;
          return {
            id: String(proj.id ?? `srv-${i}`),
            title: String(proj.title ?? ""),
            url: String(proj.url ?? ""),
            description: String(proj.description ?? ""),
            tags: Array.isArray(proj.tags) ? proj.tags.map(String) : [],
            imageUrl: proj.imageUrl ? String(proj.imageUrl) : "",
            source: "server" as const,
          };
        });
        setItems((prev) => [...serverMapped, ...prev.filter((x) => x.source !== "default"), ...defaults]);
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        showToast("Failed to load projects from server", "error");
      });
  }, []);

  // When admin status changes, default import target accordingly
  useEffect(() => {
    setImportToServer(isAdmin);
  }, [isAdmin]);

  const localOnly = useMemo(() => items.filter((i) => i.source === "local"), [items]);

  const saveLocal = useCallback((list: Project[]) => {
    const onlyLocal = list.filter((i) => i.source === "local");
    const dataString = JSON.stringify(onlyLocal);
    const sizeInMB = new Blob([dataString]).size / (1024 * 1024);

    try {
      localStorage.setItem(STORAGE_KEY, dataString);
    } catch (err) {
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        alert(
          `Storage quota exceeded! Your projects data is ${sizeInMB.toFixed(2)}MB.\n\n` +
          `Tips to reduce size:\n` +
          `• Use smaller image files (under 500KB each)\n` +
          `• Use image URLs instead of uploading\n` +
          `• Delete old projects you don't need\n` +
          `• Consider using the Google Sheets integration for backup`
        );
        throw err;
      }
      throw err;
    }
  }, []);

  const handleLogin = useCallback(async (password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    const data: LoginResponse = await response.json();

    if (response.ok && data.success) {
      setIsAdmin(true);
      setShowAdminLogin(false);
    } else {
      alert(data.error || "Incorrect password");
      throw new Error(data.error || "Login failed");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Ignore errors
    }
    setIsAdmin(false);
  }, []);

  const handleSaveToSheets = useCallback(async (data: ProjectFormData): Promise<boolean> => {
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          url: data.url.trim(),
          description: data.description.trim(),
          tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
          imageUrl: data.images[0] || "",
          images: data.images.filter(Boolean),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to save to Google Sheets");
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save to Google Sheets";
      alert(`Error: ${message}`);
      return false;
    }
  }, []);

  const handleSaveProject = useCallback(async (data: ProjectFormData) => {
    const validImages = data.images.filter(Boolean);

    if (editingProject) {
      // Update existing project
      if (editingProject.source === "server") {
        try {
          const payload = {
            title: data.title.trim(),
            url: data.url.trim(),
            description: data.description.trim(),
            tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
            imageUrl: validImages[0] || "",
          };
          const res = await fetch(`/api/projects/${editingProject.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const j: Record<string, unknown> = await res.json().catch(() => ({} as Record<string, unknown>));
            const msg = typeof (j as { error?: unknown }).error === 'string'
              ? ((j as { error?: unknown }).error as string)
              : `Update failed (${res.status})`;
            throw new Error(msg);
          }
          const updated = await res.json();
          const next = items.map((it) => it.id === editingProject.id
            ? { ...it, ...updated, source: 'server' as const }
            : it);
          setItems(next);
          showToast('Updated on server', 'success');
        } catch (err) {
          alert(err instanceof Error ? err.message : "Failed to update server project");
          return;
        }
      } else {
        const next = items.map((item) =>
          item.id === editingProject.id
            ? {
              ...item,
              title: data.title.trim(),
              url: data.url.trim(),
              description: data.description.trim(),
              tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
              images: validImages,
              imageUrl: validImages[0] || "",
            }
            : item
        );
        setItems(next);
        saveLocal(next);
        showToast('Updated (local)', 'info');
      }
    } else {
      // Add new project
      const payload = {
        title: data.title.trim(),
        url: data.url.trim(),
        description: data.description.trim(),
        tags: data.tags,
        imageUrl: validImages[0] || "",
      };

      if (isAdmin) {
        // Persist on server when logged in as admin
        try {
          const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const j: Record<string, unknown> = await res.json().catch(() => ({} as Record<string, unknown>));
            const msg = typeof (j as { error?: unknown }).error === 'string'
              ? ((j as { error?: unknown }).error as string)
              : `Create failed (${res.status})`;
            throw new Error(msg);
          }
          const created = await res.json();
          const newServer: Project = {
            id: String(created.id),
            title: String(created.title),
            url: String(created.url),
            description: String(created.description || ''),
            tags: Array.isArray(created.tags) ? created.tags.map(String) : data.tags.split(',').map((t) => t.trim()).filter(Boolean),
            imageUrl: created.imageUrl ? String(created.imageUrl) : (validImages[0] || ''),
            images: validImages,
            source: 'server',
          };
          setItems((prev) => [newServer, ...prev]);
          showToast('Saved to server', 'success');
        } catch (err) {
          // Fallback to local if server add fails
          alert(err instanceof Error ? err.message : 'Failed to add on server; saving locally.');
          const newItem: Project = {
            id: `local-${crypto.randomUUID()}`,
            title: payload.title,
            url: payload.url,
            description: payload.description,
            tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
            images: validImages,
            imageUrl: payload.imageUrl,
            source: 'local',
          };
          const next = [newItem, ...items];
          setItems(next);
          saveLocal(next);
          showToast('Saved locally (server unavailable)', 'info');
        }
      } else {
        // Not admin: keep client-side only
        const newItem: Project = {
          id: `local-${crypto.randomUUID()}`,
          title: payload.title,
          url: payload.url,
          description: payload.description,
          tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
          images: validImages,
          imageUrl: payload.imageUrl,
          source: 'local',
        };
        const next = [newItem, ...items];
        setItems(next);
        saveLocal(next);
        showToast('Saved locally', 'info');
      }
    }

    setEditingProject(null);
    setShowForm(false);
  }, [editingProject, items, isAdmin, saveLocal]);

  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingProject(null);
    setShowForm(false);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const current = items.find((i) => i.id === id);
    if (current?.source === 'server') {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
          // session cookie carries admin auth
          headers: {},
          credentials: 'include',
        });
        if (!res.ok) {
          const j: Record<string, unknown> = await res.json().catch(() => ({} as Record<string, unknown>));
          const msg = typeof (j as { error?: unknown }).error === 'string'
            ? ((j as { error?: unknown }).error as string)
            : `Delete failed (${res.status})`;
          throw new Error(msg);
        }
        showToast('Deleted from server', 'success');
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete server project");
        return;
      }
    }
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveLocal(next);
    if (editingProject?.id === id) {
      handleCancelEdit();
    }
    if (!current || current.source !== 'server') {
      showToast('Deleted (local)', 'info');
    }
  }, [items, editingProject, saveLocal, handleCancelEdit]);

  const handleClearLocal = useCallback(() => {
    if (!confirm("Remove all local projects from this browser?")) return;
    const next = items.filter((i) => i.source !== "local");
    setItems(next);
    saveLocal(next);
  }, [items, saveLocal]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        saveLocal(newItems);
        return newItems;
      });
    }
  }, [saveLocal]);

  const handleExport = useCallback(() => {
    const localProjects = items.filter((i) => i.source === "local");
    const dataStr = JSON.stringify(localProjects, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qcode-projects-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as unknown;

        if (isAdmin && importToServer) {
          // As admin, import directly to server to persist data
          const rawList = Array.isArray(imported) ? imported : (imported as { projects: unknown[] }).projects || [];
          const body = {
            projects: (rawList as Record<string, unknown>[]).map(p => ({
              ...p,
              url: p.url && typeof p.url === 'string' && !/^https?:\/\//i.test(p.url)
                ? `https://${p.url}`
                : p.url
            }))
          };

          const res = await fetch('/api/admin/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
          });
          const j = await res.json().catch(() => ({} as Record<string, unknown>));
          if (!res.ok) throw new Error((j as { error?: string }).error || `Import failed (${res.status})`);

          // Refresh from server
          const serverRes = await fetch('/api/projects', { credentials: 'include' });
          const serverList = await serverRes.json().catch(() => []);
          const serverMapped: Project[] = Array.isArray(serverList)
            ? serverList.map((p: Record<string, unknown>, i: number) => {
              const rec = p as { id?: unknown; title?: unknown; url?: unknown; description?: unknown; tags?: unknown; imageUrl?: unknown };
              const tags = Array.isArray(rec.tags) ? (rec.tags as unknown[]).map(String) : [];
              return {
                id: String(rec.id ?? `srv-${i}`),
                title: String(rec.title ?? ''),
                url: String(rec.url ?? ''),
                description: String(rec.description ?? ''),
                tags,
                imageUrl: rec.imageUrl ? String(rec.imageUrl) : '',
                source: 'server' as const,
              };
            })
            : [];
          setItems((prev) => [
            ...serverMapped,
            ...prev.filter((i) => i.source !== 'server' && i.source !== 'default'),
            ...prev.filter((i) => i.source === 'default'),
          ]);
          setToast({ message: `Imported ${j?.imported ?? ''} to server`, type: 'success' });
        } else {
          // Not admin: keep local-only import
          const list = Array.isArray(imported) ? (imported as Project[]) : [];
          const next = [...list, ...items.filter((i) => i.source !== 'local')];
          setItems(next);
          saveLocal(next);
          setToast({ message: `Imported ${list.length} locally`, type: 'info' });
        }
      } catch (err) {
        alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be imported again
    e.target.value = '';
  }, [isAdmin, importToServer, items, saveLocal]);

  return (
    <section className="space-y-6" id="projects">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
        <div className="flex gap-3">
          {isAdmin ? (
            <>
              <Button
                onClick={() => {
                  if (showForm) {
                    handleCancelEdit();
                  } else {
                    setShowForm(true);
                  }
                }}
                variant="primary"
              >
                {showForm ? "✕ Close" : "+ Add Project"}
              </Button>
              <Button onClick={handleClearLocal} variant="secondary" title="Remove all local projects from this browser">
                Clear Local
              </Button>
              <Button onClick={handleExport} variant="secondary" title="Export projects to JSON file">
                📥 Export
              </Button>              {isAdmin && (
                <label className="flex items-center gap-2 text-xs text-slate-300 px-2 py-1 border border-slate-700 rounded">
                  <input
                    type="checkbox"
                    className="accent-blue-500"
                    checked={importToServer}
                    onChange={(e) => setImportToServer(e.target.checked)}
                  />
                  Import to server
                </label>
              )}
              <Button as="label" variant="secondary" title="Import projects from JSON file" className="cursor-pointer">
                📤 Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  aria-label="Import projects"
                />
              </Button>
              <Button onClick={handleLogout} variant="danger">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowAdminLogin(true)} variant="secondary">
              🔐 Admin Login
            </Button>
          )}
        </div>
      </div>

      <ErrorBoundary>
        {showAdminLogin && !isAdmin && (
          <AdminLogin
            onLogin={handleLogin}
            onCancel={() => setShowAdminLogin(false)}
          />
        )}
      </ErrorBoundary>

      <ErrorBoundary>
        {showForm && (
          <ProjectForm
            editingId={editingProject?.id || null}
            initialTitle={editingProject?.title}
            initialUrl={editingProject?.url}
            initialDescription={editingProject?.description}
            initialTags={editingProject?.tags.join(", ")}
            initialImages={editingProject?.images || (editingProject?.imageUrl ? [editingProject.imageUrl] : [])}
            onSave={handleSaveProject}
            onCancel={handleCancelEdit}
            onSaveToSheets={handleSaveToSheets}
          />
        )}
      </ErrorBoundary>

      <ErrorBoundary>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => (
                <MemoizedSortableProjectCard
                  key={p.id}
                  project={p}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ErrorBoundary>

      {isAdmin ? (
        <div className="text-xs text-slate-400">
          You’re logged in. New projects save to the server.
        </div>
      ) : null}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </section>
  );
}


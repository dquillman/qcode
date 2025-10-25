"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import ProjectCard from "@/components/ProjectCard";
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
      />
      {isAdmin && project.source === "local" && project.id.startsWith("local-") && (
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check auth status on mount
  useEffect(() => {
    fetch('/api/auth/check')
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
      .catch(() => {
        // ignore fetch errors silently
      });
  }, []);

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
      await fetch('/api/auth/logout', { method: 'POST' });
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
    } else {
      // Add new project
      const newItem: Project = {
        id: `local-${crypto.randomUUID()}`,
        title: data.title.trim(),
        url: data.url.trim(),
        description: data.description.trim(),
        tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: validImages,
        imageUrl: validImages[0] || "",
        source: "local",
      };
      const next = [newItem, ...items];
      setItems(next);
      saveLocal(next);
    }

    setEditingProject(null);
    setShowForm(false);
  }, [editingProject, items, saveLocal]);

  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingProject(null);
    setShowForm(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (!confirm("Delete this project?")) return;
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveLocal(next);
    if (editingProject?.id === id) {
      handleCancelEdit();
    }
  }, [items, editingProject, saveLocal, handleCancelEdit]);

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

      {localOnly.length > 0 && (
        <div className="text-xs text-slate-400">
          Your added projects are saved only in this browser (localStorage).
        </div>
      )}
    </section>
  );
}

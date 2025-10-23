"use client";
import { useEffect, useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { projects as defaultProjects } from "@/data/projects";
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

type Project = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string; // Legacy support for single image
  images?: string[]; // New: array of up to 5 images
  source?: "default" | "local" | "server";
};

const STORAGE_KEY = "qcode-projects";

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
        >
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="text-xs px-2 py-1 rounded bg-red-500/30 hover:bg-red-500/40 border border-red-500/40"
            title="Delete local project"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectsSection() {
  const [items, setItems] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveToSheets, setSaveToSheets] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem("qcode-admin-session");
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        // Session valid for 24 hours
        if (session.expiry && new Date(session.expiry) > new Date()) {
          setIsAdmin(true);
        } else {
          localStorage.removeItem("qcode-admin-session");
        }
      } catch {
        localStorage.removeItem("qcode-admin-session");
      }
    }

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

  const saveLocal = (list: Project[]) => {
    const onlyLocal = list.filter((i) => i.source === "local");
    const dataString = JSON.stringify(onlyLocal);

    // Check size (localStorage typically has 5-10MB limit)
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
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reduce max file size to 500KB to help prevent quota issues
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      alert(
        `Image size must be less than 500KB to prevent storage issues.\n\n` +
        `Your image: ${(file.size / 1024).toFixed(0)}KB\n\n` +
        `Tips:\n` +
        `• Resize images before uploading\n` +
        `• Use image compression tools\n` +
        `• Or paste an image URL instead`
      );
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImages(prev => {
        const newImages = [...prev];
        newImages[index] = base64String;
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlInput = (value: string, index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = value;
      return newImages;
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setTitle(project.title);
    setUrl(project.url);
    setDescription(project.description);
    setTags(project.tags.join(", "));
    // Support legacy single image or new multiple images
    const projectImages = project.images || (project.imageUrl ? [project.imageUrl] : []);
    setImages(projectImages);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setDescription("");
    setTags("");
    setImages([]);
    setShowForm(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - you can change this password
    const correctPassword = "admin123"; // Change this to your desired password

    if (adminPassword === correctPassword) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword("");

      // Save session for 24 hours
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      localStorage.setItem("qcode-admin-session", JSON.stringify({ expiry: expiry.toISOString() }));
    } else {
      alert("Incorrect password");
      setAdminPassword("");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("qcode-admin-session");
  };

  const saveToGoogleSheets = async () => {
    setSheetStatus("Saving to Google Sheets...");
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          description: description.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          imageUrl: images[0] || "", // Send first image for backward compatibility
          images: images.filter(Boolean), // Send all images
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save to Google Sheets");
      }

      setSheetStatus("✓ Saved to Google Sheets!");
      setTimeout(() => setSheetStatus(null), 3000);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save to Google Sheets";
      setSheetStatus(`Error: ${message}`);
      setTimeout(() => setSheetStatus(null), 5000);
      return false;
    }
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("Title and URL are required");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      alert("URL must start with http:// or https://");
      return;
    }

    // Filter out empty images
    const validImages = images.filter(Boolean);

    // Save to Google Sheets if checkbox is checked
    if (saveToSheets && !editingId) {
      const sheetSuccess = await saveToGoogleSheets();
      if (!sheetSuccess) {
        return; // Don't continue if Google Sheets save failed
      }
    }

    try {
      if (editingId) {
        // Update existing project
        const next = items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: title.trim(),
                url: url.trim(),
                description: description.trim(),
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                images: validImages,
                imageUrl: validImages[0] || "", // Keep legacy field for compatibility
              }
            : item
        );
        setItems(next);
        saveLocal(next);
      } else {
        // Add new project
        const newItem: Project = {
          id: `local-${crypto.randomUUID()}`,
          title: title.trim(),
          url: url.trim(),
          description: description.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          images: validImages,
          imageUrl: validImages[0] || "", // Keep legacy field for compatibility
          source: "local",
        };
        const next = [newItem, ...items];
        setItems(next);
        saveLocal(next);
      }

      setEditingId(null);
      setTitle("");
      setUrl("");
      setDescription("");
      setTags("");
      setImages([]);
      setSaveToSheets(false);
      setShowForm(false);
    } catch (err) {
      // If save failed due to quota, don't close the form so user can make changes
      console.error("Failed to save project:", err);
    }
  };

  const deleteLocal = (id: string) => {
    if (!confirm("Delete this project?")) return;
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveLocal(next);
    if (editingId === id) {
      cancelEdit();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Save the new order to localStorage
        saveLocal(newItems);

        return newItems;
      });
    }
  };

  return (
    <section className="space-y-6" id="projects">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
        <div className="flex gap-3">
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  if (showForm) {
                    cancelEdit();
                  } else {
                    setShowForm(true);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
              >
                {showForm ? "✕ Close" : "+ Add Project"}
              </button>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-medium transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAdminLogin(true)}
              className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-200 font-medium transition-all"
            >
              🔐 Admin Login
            </button>
          )}
        </div>
      </div>

      {showAdminLogin && !isAdmin && (
        <form onSubmit={handleAdminLogin} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-white">🔐 Admin Login</h3>
          <div className="space-y-4">
            <input
              type="password"
              className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 w-full text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdminLogin(false);
                  setAdminPassword("");
                }}
                className="px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={saveProject} className="bg-[#12161b] p-4 rounded border border-slate-800 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-2">
              {editingId ? "Edit Project" : "Add New Project"}
            </h3>
          </div>
          <input
            className="bg-white/5 border border-slate-700 rounded p-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="bg-white/5 border border-slate-700 rounded p-2"
            placeholder="Project URL (https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-slate-400">
                Images (up to 5) - Upload or paste URLs
              </label>
              <span className="text-xs text-slate-500">
                Max 500KB per upload
              </span>
            </div>
            <div className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded p-2">
              💡 Tip: To avoid storage issues, use image URLs when possible or keep uploads small
            </div>
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 w-20">Image {index + 1}:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, index)}
                    className="block flex-1 text-sm text-slate-400
                      file:mr-4 file:py-1 file:px-3
                      file:rounded file:border-0
                      file:text-xs file:font-medium
                      file:bg-white/10 file:text-slate-300
                      hover:file:bg-white/20 file:cursor-pointer"
                  />
                </div>
                {!images[index] && (
                  <input
                    type="text"
                    className="bg-white/5 border border-slate-700 rounded p-2 w-full text-sm"
                    placeholder="Or paste image URL here"
                    value=""
                    onChange={(e) => handleImageUrlInput(e.target.value, index)}
                  />
                )}
                {images[index] && (
                  <div className="relative">
                    <div className="aspect-video bg-slate-800 rounded overflow-hidden relative max-w-xs">
                      <img src={images[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-500/30 hover:bg-red-500/40 border border-red-500/40"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <textarea
            className="bg-white/5 border border-slate-700 rounded p-2 md:col-span-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="bg-white/5 border border-slate-700 rounded p-2 md:col-span-2"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          {!editingId && (
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={saveToSheets}
                  onChange={(e) => setSaveToSheets(e.target.checked)}
                  className="rounded"
                />
                Also save to Google Sheets
              </label>
            </div>
          )}
          {sheetStatus && (
            <div className="md:col-span-2 text-sm text-slate-300">
              {sheetStatus}
            </div>
          )}
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 border border-slate-700"
            >
              {editingId ? "Update Project" : "Save Project"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <SortableProjectCard
                key={p.id}
                project={p}
                isAdmin={isAdmin}
                onEdit={startEdit}
                onDelete={deleteLocal}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {localOnly.length > 0 && (
        <div className="text-xs text-slate-400">
          Your added projects are saved only in this browser (localStorage).
        </div>
      )}
    </section>
  );
}

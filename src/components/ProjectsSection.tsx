"use client";
import { useEffect, useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { projects as defaultProjects } from "@/data/projects";

type Project = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  source?: "default" | "local";
};

const STORAGE_KEY = "qcode-projects";

export default function ProjectsSection() {
  const [items, setItems] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const local: Project[] = raw ? JSON.parse(raw) : [];
      const defaults: Project[] = defaultProjects.map((p, i) => ({
        id: `default-${i}`,
        title: p.title,
        url: p.url,
        description: p.description,
        tags: p.tags,
        imageUrl: p.imageUrl || "",
        source: "default" as const,
      }));
      setItems([...local, ...defaults]);
    } catch {
      setItems(
        defaultProjects.map((p, i) => ({
          id: `default-${i}`,
          title: p.title,
          url: p.url,
          description: p.description,
          tags: p.tags,
          imageUrl: p.imageUrl || "",
          source: "default" as const,
        }))
      );
    }
  }, []);

  const localOnly = useMemo(() => items.filter((i) => i.source === "local"), [items]);

  const saveLocal = (list: Project[]) => {
    const onlyLocal = list.filter((i) => i.source === "local");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(onlyLocal));
  };

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("Title and URL are required");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      alert("URL must start with http:// or https://");
      return;
    }
    const newItem: Project = {
      id: `local-${crypto.randomUUID()}`,
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrl: imageUrl.trim(),
      source: "local",
    };
    const next = [newItem, ...items];
    setItems(next);
    saveLocal(next);
    setTitle("");
    setUrl("");
    setDescription("");
    setTags("");
    setImageUrl("");
    setShowForm(false);
  };

  const deleteLocal = (id: string) => {
    if (!confirm("Delete this project?")) return;
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveLocal(next);
  };

  return (
    <section className="space-y-4" id="projects">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 border border-slate-700 text-sm"
        >
          {showForm ? "Close" : "Add Project"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addProject} className="bg-[#12161b] p-4 rounded border border-slate-800 grid gap-3 md:grid-cols-2">
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
          <input
            className="bg-white/5 border border-slate-700 rounded p-2 md:col-span-2"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
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
          <div className="md:col-span-2">
            <button className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 border border-slate-700">
              Save Project
            </button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="relative">
            <ProjectCard
              title={p.title}
              url={p.url}
              description={p.description}
              tags={p.tags}
              imageUrl={p.imageUrl}
            />
            {p.source === "local" && (
              <button
                onClick={() => deleteLocal(p.id)}
                className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-500/30 hover:bg-red-500/40 border border-red-500/40"
                title="Delete local project"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {localOnly.length > 0 && (
        <div className="text-xs text-slate-400">
          Your added projects are saved only in this browser (localStorage).
        </div>
      )}
    </section>
  );
}

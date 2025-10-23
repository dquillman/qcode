"use client";
import { useEffect, useState } from "react";

type Project = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
};

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [serverProjects, setServerProjects] = useState<Project[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-token");
      if (saved) setToken(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("admin-token", token);
    } catch {}
  }, [token]);

  const refresh = async () => {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setServerProjects(data);
    } catch {}
  };

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!title.trim() || !url.trim()) {
      setStatus("Title and URL are required.");
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, url, description, imageUrl, tags }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed: ${res.status}`);
      }
      setStatus("Project added successfully.");
      setTitle("");
      setUrl("");
      setDescription("");
      setTags("");
      setImageUrl("");
      await refresh();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Failed to add project.");
    }
  };

  const remove = async (id: string) => {
    setStatus(null);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed: ${res.status}`);
      }
      setStatus("Deleted.");
      await refresh();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Failed to delete.");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin: Add Project</h1>
      <p className="text-sm text-slate-400">
        Provide your admin token and project details. Successful submissions will
        appear on the homepage projects list.
      </p>
      <form onSubmit={submit} className="bg-[#12161b] p-4 rounded border border-slate-800 grid gap-3">
        <input
          className="bg-white/5 border border-slate-700 rounded p-2"
          placeholder="Admin Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          type="password"
        />
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
          className="bg-white/5 border border-slate-700 rounded p-2"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <textarea
          className="bg-white/5 border border-slate-700 rounded p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="bg-white/5 border border-slate-700 rounded p-2"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div>
          <button className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 border border-slate-700">
            Add Project
          </button>
        </div>
        {status && <div className="text-sm text-slate-300">{status}</div>}
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Server Projects</h2>
          <button
            onClick={refresh}
            className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-slate-700"
          >
            Refresh
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {serverProjects.length === 0 && (
            <div className="text-sm text-slate-400">No server projects yet.</div>
          )}
          {serverProjects.map((p) => (
            <div key={p.id} className="bg-[#12161b] border border-slate-800 rounded p-3">
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-slate-400 break-all">{p.url}</div>
              {p.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-white/10 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <button
                  onClick={() => remove(p.id)}
                  className="text-xs px-2 py-1 rounded bg-red-500/30 hover:bg-red-500/40 border border-red-500/40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

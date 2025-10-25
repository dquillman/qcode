"use client";
import { useState, useCallback } from "react";

type ProjectFormProps = {
  editingId: string | null;
  initialTitle?: string;
  initialUrl?: string;
  initialDescription?: string;
  initialTags?: string;
  initialImages?: string[];
  onSave: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  onSaveToSheets?: (data: ProjectFormData) => Promise<boolean>;
};

export type ProjectFormData = {
  title: string;
  url: string;
  description: string;
  tags: string;
  images: string[];
};

const MAX_FILE_SIZE = 500 * 1024; // 500KB

export default function ProjectForm({
  editingId,
  initialTitle = "",
  initialUrl = "",
  initialDescription = "",
  initialTags = "",
  initialImages = [],
  onSave,
  onCancel,
  onSaveToSheets,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [url, setUrl] = useState(initialUrl);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState(initialTags);
  const [images, setImages] = useState<string[]>(initialImages);
  const [saveToSheets, setSaveToSheets] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
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
  }, []);

  const handleImageUrlInput = useCallback((value: string, index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = value;
      return newImages;
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      alert("Title and URL are required");
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      alert("URL must start with http:// or https://");
      return;
    }

    setIsLoading(true);

    try {
      // Save to Google Sheets if checkbox is checked and we have the handler
      if (saveToSheets && !editingId && onSaveToSheets) {
        setSheetStatus("Saving to Google Sheets...");
        const formData = {
          title,
          url,
          description,
          tags,
          images: images.filter(Boolean),
        };
        const sheetSuccess = await onSaveToSheets(formData);
        if (!sheetSuccess) {
          return; // Don't continue if Google Sheets save failed
        }
        setSheetStatus("✓ Saved to Google Sheets!");
      }

      // Save the project
      await onSave({
        title,
        url,
        description,
        tags,
        images: images.filter(Boolean),
      });

      // Reset form
      setTitle("");
      setUrl("");
      setDescription("");
      setTags("");
      setImages([]);
      setSaveToSheets(false);
      setSheetStatus(null);
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#12161b] p-4 rounded border border-slate-800 grid gap-3 md:grid-cols-2"
      role="form"
      aria-label={editingId ? "Edit project form" : "Add project form"}
    >
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
        disabled={isLoading}
        aria-label="Project title"
        required
      />

      <input
        className="bg-white/5 border border-slate-700 rounded p-2"
        placeholder="Project URL (https://...)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
        aria-label="Project URL"
        required
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
                disabled={isLoading}
                aria-label={`Upload image ${index + 1}`}
                className="block flex-1 text-sm text-slate-400
                  file:mr-4 file:py-1 file:px-3
                  file:rounded file:border-0
                  file:text-xs file:font-medium
                  file:bg-white/10 file:text-slate-300
                  hover:file:bg-white/20 file:cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {!images[index] && (
              <input
                type="text"
                className="bg-white/5 border border-slate-700 rounded p-2 w-full text-sm"
                placeholder="Or paste image URL here"
                value=""
                onChange={(e) => handleImageUrlInput(e.target.value, index)}
                disabled={isLoading}
                aria-label={`Image URL ${index + 1}`}
              />
            )}
            {images[index] && (
              <div className="relative">
                <div className="aspect-video bg-slate-800 rounded overflow-hidden relative max-w-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={isLoading}
                  className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-500/30 hover:bg-red-500/40 border border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Remove image ${index + 1}`}
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
        disabled={isLoading}
        aria-label="Project description"
      />

      <input
        className="bg-white/5 border border-slate-700 rounded p-2 md:col-span-2"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        disabled={isLoading}
        aria-label="Project tags"
      />

      {!editingId && onSaveToSheets && (
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={saveToSheets}
              onChange={(e) => setSaveToSheets(e.target.checked)}
              disabled={isLoading}
              className="rounded"
              aria-label="Save to Google Sheets"
            />
            Also save to Google Sheets
          </label>
        </div>
      )}

      {sheetStatus && (
        <div className="md:col-span-2 text-sm text-slate-300" role="status" aria-live="polite">
          {sheetStatus}
        </div>
      )}

      <div className="md:col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={editingId ? "Update project" : "Save project"}
        >
          {isLoading ? "Saving..." : editingId ? "Update Project" : "Save Project"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

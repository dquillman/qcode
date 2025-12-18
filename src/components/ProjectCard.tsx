"use client";
import { useState } from "react";
import Image from "next/image";

type ProjectCardProps = {
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  images?: string[];
  source?: 'local' | 'server' | 'default';
};

export default function ProjectCard({ title, url, description, tags, imageUrl, images, source }: ProjectCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Support both new images array and legacy single imageUrl
  const allImages = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
  const hasImages = allImages.length > 0;
  const hasMultipleImages = allImages.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click target is a button or inside a button, don't navigate
    if ((e.target as HTMLElement).closest('button')) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDownCard = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDownCard}
      role="link"
      tabIndex={0}
      className="group block bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {hasImages && (
        <div
          className="mb-4 aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden relative group/image shadow-lg"
          onKeyDown={hasMultipleImages ? handleKeyDown : undefined}
          tabIndex={hasMultipleImages ? 0 : undefined}
          role={hasMultipleImages ? "region" : undefined}
          aria-label={hasMultipleImages ? `Image carousel for ${title}, image ${currentImageIndex + 1} of ${allImages.length}` : undefined}
        >
          <Image src={allImages[currentImageIndex]} alt={`${title} screenshot ${currentImageIndex + 1}`} fill className="object-cover" unoptimized />

          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all shadow-lg font-bold"
                aria-label="Previous image"
                title="Previous image (or press left arrow)"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all shadow-lg font-bold"
                aria-label="Next image"
                title="Next image (or press right arrow)"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm" role="status" aria-live="polite" aria-label={`Image ${currentImageIndex + 1} of ${allImages.length}`}>
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? "bg-blue-400 w-6" : "bg-white/60"
                      }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <h3 className="font-bold text-xl mb-2 text-white group-hover:text-blue-300 transition-colors">{title}</h3>
      {description && <p className="text-sm text-slate-300 mb-4 leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">{description}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}
      {source && (
        <div className="absolute top-2 right-2">
          {source === 'local' && (
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300 bg-yellow-500/20 border border-yellow-500/30 rounded-full backdrop-blur-md shadow-sm">
              Local Only
            </span>
          )}
          {source === 'server' && (
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-md shadow-sm">
              Cloud Synced
            </span>
          )}
        </div>
      )}
    </div>
  );
}

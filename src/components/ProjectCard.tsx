type ProjectCardProps = {
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
};

export default function ProjectCard({ title, url, description, tags, imageUrl }: ProjectCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#12161b] border border-slate-800 rounded-lg p-4 hover:border-slate-600 transition-colors"
    >
      {imageUrl && (
        <div className="mb-3 aspect-video bg-slate-800 rounded overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-3">{description}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 bg-white/10 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}

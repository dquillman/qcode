export type Project = {
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
};

export const projects: Project[] = [
  {
    title: "Example Project",
    url: "https://github.com",
    description: "This is an example project. Replace with your own projects.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
  },
];

import ProjectsSection from "@/components/ProjectsSection";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">My Projects</h1>
          <p className="text-slate-400">
            A collection of projects and work. Add your own by clicking the &quot;Add Project&quot; button below.
          </p>
        </div>
        <ProjectsSection />
      </main>
    </div>
  );
}

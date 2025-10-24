import ProjectsSection from "@/components/ProjectsSection";
import { VERSION } from "@/config/version";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mb-16 text-center">
          <div className="inline-block mb-4">
            <span className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Code Q
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4 text-white">
            Projects Portfolio
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            A collection of projects and work by{" "}
            <span className="font-semibold text-blue-300">Dave Quillman &quot;Q&quot;</span>
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm">
              ✨ Welcome!
            </div>
            <div className="px-4 py-2 bg-slate-700/30 border border-slate-600/30 rounded-full text-slate-400 text-sm font-mono">
              v{VERSION}
            </div>
          </div>
        </div>
        <ProjectsSection />
      </main>
    </div>
  );
}

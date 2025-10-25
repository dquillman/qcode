"use client";
import { useState } from "react";

type AdminLoginProps = {
  onLogin: (password: string) => Promise<void>;
  onCancel: () => void;
};

export default function AdminLogin({ onLogin, onCancel }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(password);
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-xl"
      role="form"
      aria-label="Admin login form"
    >
      <h3 className="text-xl font-bold mb-4 text-white">🔐 Admin Login</h3>
      <div className="space-y-4">
        <input
          type="password"
          className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 w-full text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoFocus
          aria-label="Admin password"
          required
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Login button"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel login"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

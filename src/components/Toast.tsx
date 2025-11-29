"use client";
import React, { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "info" | "error";
  durationMs?: number;
  onClose: () => void;
};

export default function Toast({ message, type = "info", durationMs = 2500, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onClose]);

  const color =
    type === "success" ? "from-emerald-500 to-emerald-600 border-emerald-400/40" :
    type === "error" ? "from-rose-500 to-rose-600 border-rose-400/40" :
    "from-slate-600 to-slate-700 border-slate-400/30";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        role="status"
        className={`px-4 py-2 rounded-lg text-white shadow-lg border backdrop-blur-sm bg-gradient-to-r ${color}`}
      >
        {message}
      </div>
    </div>
  );
}


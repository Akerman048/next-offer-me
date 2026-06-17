"use client";

import { useFormStatus } from "react-dom";

export default function GenerateRoadmapButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex items-center justify-center gap-3 rounded-[24px] bg-emerald-500 px-6 py-4 text-sm font-black text-white shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-1 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? "Generating roadmap..." : "Generate roadmap"}

      <span className="text-xl transition group-hover:translate-x-1">
        {pending ? "⏳" : "›"}
      </span>
    </button>
  );
}
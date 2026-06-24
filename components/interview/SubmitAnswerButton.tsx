"use client";

import { useFormStatus } from "react-dom";

export default function SubmitAnswerButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-violet-500 px-5 py-3 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {pending
        ? "Submitting answer..."
        : "Submit answer"}
    </button>
  );
}

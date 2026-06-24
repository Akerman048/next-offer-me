"use client";

import { useFormStatus } from "react-dom";

export default function EvaluateAnswerButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-black px-4 py-2 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Evaluating answer..." : "Get AI feedback"}
    </button>
  );
}

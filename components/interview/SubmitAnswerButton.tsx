"use client";

import { useFormStatus } from "react-dom";

export default function SubmitAnswerButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="
        rounded-lg
        bg-black
        px-5
        py-3
        text-white
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {pending
        ? "Submitting answer..."
        : "Submit answer"}
    </button>
  );
}
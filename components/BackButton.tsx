"use client";

import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="rounded-lg border px-4 py-2 transation hover:bg-gray-700 hover:cursor-pointer"
    >
      ← Back
    </button>
  );
};

export default BackButton;

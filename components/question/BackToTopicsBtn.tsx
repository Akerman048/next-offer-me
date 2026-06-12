"use client";

import { useRouter } from "next/navigation";

const BackToTopicsBtn = ({text}: {text:string}) => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/topics')}
      className="rounded-lg border px-4 py-2 transation hover:bg-gray-700 hover:cursor-pointer"
    >
      
      {text}
    </button>
  );
};

export default BackToTopicsBtn;

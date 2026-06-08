import Link from "next/link";
import { prisma } from "@/lib/prisma";

const Topics = async () => {
  const topics = await prisma.topic.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-4xl font-bold">Interview Topics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            className="group rounded-2xl border border-slate-200 bg-mist-300 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold transition group-hover:text-slate-700">
              {topic.name}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Practice interview questions
            </p>

            <div className="mt-4 flex items-center text-sm font-medium text-slate-600">
              Start →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default Topics;

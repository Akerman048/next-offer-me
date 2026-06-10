import { prisma } from "@/lib/prisma";
import { Level } from "@/generated/prisma/enums";
import { startInterview } from "./actions";

export default async function InterviewPage() {
  const topics = await prisma.topic.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-8 text-4xl font-bold">Interview Training</h1>

      <form action={startInterview} className="rounded-xl border p-6 shadow-sm">
        <div className="mb-4">
          <label className="mb-2 block font-medium">Mode</label>

          <select name="mode" className="w-full rounded-lg border p-3">
            <option value="PRACTICE">Practice · no pressure</option>
            <option value="REAL">Real interview · 90 sec/question</option>
            <option value="HARD">Hard mode · 60 sec/question</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-medium">Topics</label>

          <p className="mb-3 text-sm text-gray-500">
            Leave empty to use all topics.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {topics.map((topic) => (
              <label key={topic.id} className="flex items-center gap-2">
                <input type="checkbox" name="topics" value={topic.slug} />
                {topic.name}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium">Level</label>

          <select name="level" className="w-full rounded-lg border p-3">
            <option value="">All levels</option>
            <option value={Level.JUNIOR}>Junior</option>
            <option value={Level.MIDDLE}>Middle</option>
            <option value={Level.SENIOR}>Senior</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-medium">Number of questions</label>

          <select
            name="questionCount"
            defaultValue="5"
            className="w-full rounded-lg border p-3"
          >
            <option value="5">5 questions · about 8 minutes</option>
            <option value="10">10 questions · about 15 minutes</option>
            <option value="15">15 questions · about 23 minutes</option>
            <option value="20">20 questions · about 30 minutes</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-5 py-3 text-white"
        >
          Start interview
        </button>
      </form>
    </main>
  );
}
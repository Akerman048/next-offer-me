import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RoadmapsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const roadmaps = await prisma.roadmap.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">AI Roadmaps</h1>
          <p className="mt-2 text-gray-500">
            Your personalized learning plans generated from interview results.
          </p>
        </div>

        <Link
          href="/interview"
          className="rounded-lg bg-black px-5 py-3 text-white"
        >
          Start interview
        </Link>
      </div>

      {roadmaps.length === 0 ? (
        <section className="rounded-xl border p-6">
          <h2 className="mb-2 text-xl font-semibold">No roadmaps yet</h2>
          <p className="mb-4 text-gray-500">
            Complete an interview, then generate a roadmap from your weak answers.
          </p>

          <Link
            href="/interview"
            className="inline-block rounded-lg bg-black px-5 py-3 text-white"
          >
            Start your first interview
          </Link>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.id}
              href={`/roadmaps/${roadmap.id}`}
              className="rounded-xl border p-5 shadow-sm transition hover:bg-slate-700"
            >
              <h2 className="mb-2 text-xl font-semibold">{roadmap.title}</h2>

              <p className="line-clamp-4 text-sm text-gray-500">
                {roadmap.summary ?? "Personalized roadmap based on your weak interview answers."}
              </p>

              <p className="mt-4 text-xs text-gray-500">
                Created {roadmap.createdAt.toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
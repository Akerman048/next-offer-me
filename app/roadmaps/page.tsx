import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

import { deleteRoadmap } from "./actions";

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
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-3xl border border-border bg-card p-8 shadow-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-muted">
            AI learning plans
          </p>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">AI Roadmaps</h1>

              <p className="mt-4 max-w-2xl text-muted">
                Personalized learning plans generated from your interview
                results and weak areas.
              </p>
            </div>

            <Link
              href="/interview"
              className="rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02]"
            >
              Start interview
            </Link>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Total roadmaps</p>

            <h2 className="mt-2 text-4xl font-bold">{roadmaps.length}</h2>

            <p className="mt-2 text-sm text-muted">
              Generated from interview results
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Latest roadmap</p>

            <h2 className="mt-2 line-clamp-1 text-2xl font-bold">
              {roadmaps[0]?.title ?? "Not created yet"}
            </h2>

            <p className="mt-2 text-sm text-muted">
              Continue your most recent plan
            </p>
          </div>

          <Link
            href="/interview"
            className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground transition hover:scale-[1.02]"
          >
            <p className="text-sm font-medium opacity-70">Need a new plan?</p>

            <h2 className="mt-2 text-2xl font-bold">Take interview →</h2>
          </Link>
        </section>

        {roadmaps.length === 0 ? (
          <section className="rounded-3xl border border-border bg-card p-8 shadow-xl">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-muted">
                No roadmaps yet
              </p>

              <h2 className="text-3xl font-bold">
                Generate your first AI roadmap
              </h2>

              <p className="mt-4 text-muted">
                Complete an interview, wait for AI feedback, then generate a
                focused 4-week learning roadmap based on your weak answers.
              </p>

              <Link
                href="/interview"
                className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition"
              >
                Start your first interview
              </Link>
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Your roadmaps</h2>

                <p className="mt-1 text-sm text-muted">
                  Open a roadmap and track your weekly progress.
                </p>
              </div>

              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted">
                {roadmaps.length} roadmaps
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-lg transition hover:-translate-y-1 hover:bg-card-hover"
                >
                  <Link href={`/roadmaps/${roadmap.id}`} className="block">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                        AI
                      </div>

                      <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted">
                        {roadmap.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold transition hover:text-gray-100">
                      {roadmap.title}
                    </h3>

                    <p className="line-clamp-3 text-sm text-muted">
                      {roadmap.summary ??
                        "Personalized roadmap based on your weak interview answers."}
                    </p>
                  </Link>

                  <div className="mt-5 flex items-center justify-between">
                    <Link
                      href={`/roadmaps/${roadmap.id}`}
                      className="text-sm font-medium text-gray-200"
                    >
                      Open roadmap
                    </Link>

                    <form action={deleteRoadmap}>
                      <input
                        type="hidden"
                        name="roadmapId"
                        value={roadmap.id}
                      />

                      <button
                        type="submit"
                        className="rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

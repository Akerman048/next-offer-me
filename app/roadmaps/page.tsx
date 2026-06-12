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
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <section className="relative mb-7 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute right-28 top-16 h-2 w-2 rounded-full bg-violet-400/30" />
          <div className="pointer-events-none absolute right-96 top-20 h-2 w-2 rounded-full bg-violet-400/30" />

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-violet-400">
            AI learning plans
          </p>

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
                AI Roadmaps
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Personalized learning plans generated from your interview
                results and weak areas.
              </p>
            </div>

            <Link
              href="/interview"
              className="inline-flex items-center justify-center rounded-2xl bg-violet-500 px-7 py-4 font-bold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:bg-violet-400"
            >
              Start interview
              <span className="ml-3 text-xl">›</span>
            </Link>
          </div>
        </section>

        <section className="mb-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-3xl text-violet-300">
                🗺️
              </div>

              <div>
                <p className="text-sm text-slate-300">Total roadmaps</p>
                <h2 className="mt-1 text-4xl font-black text-white">
                  {roadmaps.length}
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Generated from interview results
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-3xl text-blue-300">
                ⚡
              </div>

              <div className="min-w-0">
                <p className="text-sm text-slate-300">Latest roadmap</p>
                <h2 className="mt-1 line-clamp-1 text-2xl font-black text-white">
                  {roadmaps[0]?.title ?? "Not created yet"}
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Continue your most recent plan
            </p>
          </div>

          <Link
            href="/interview"
            className="group relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-violet-500 p-6 text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 hover:bg-violet-400"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />

            <p className="relative text-sm font-medium text-violet-100">
              Need a new plan?
            </p>

            <h2 className="relative mt-3 text-3xl font-black">
              Take interview
              <span className="ml-2 transition group-hover:ml-4">›</span>
            </h2>
          </Link>
        </section>

        {roadmaps.length === 0 ? (
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl">
            <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-96 rounded-full bg-gradient-to-r from-violet-500/20 via-blue-500/10 to-emerald-500/20 blur-3xl" />

            <div className="relative max-w-2xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-3xl text-violet-300">
                🧭
              </div>

              <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-violet-400">
                No roadmaps yet
              </p>

              <h2 className="text-4xl font-black text-white">
                Generate your first AI roadmap
              </h2>

              <p className="mt-5 text-sm leading-6 text-slate-400">
                Complete an interview, wait for AI feedback, then generate a
                focused 4-week learning roadmap based on your weak answers.
              </p>

              <Link
                href="/interview"
                className="mt-7 inline-flex rounded-2xl bg-violet-500 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 hover:bg-violet-400"
              >
                Start your first interview
              </Link>
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-black text-white">
                  <span className="text-violet-400">🧭</span>
                  Your roadmaps
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Open a roadmap and track your weekly progress.
                </p>
              </div>

              <span className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 backdrop-blur-xl">
                {roadmaps.length} roadmaps
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card-hover"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20" />

                  <Link href={`/roadmaps/${roadmap.id}`} className="relative block">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-lg font-black text-violet-200">
                        AI
                      </div>

                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                        {roadmap.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="mb-3 text-2xl font-black text-white transition group-hover:text-violet-200">
                      {roadmap.title}
                    </h3>

                    <p className="line-clamp-3 text-sm leading-6 text-slate-400">
                      {roadmap.summary ??
                        "Personalized roadmap based on your weak interview answers."}
                    </p>
                  </Link>

                  <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                    <Link
                      href={`/roadmaps/${roadmap.id}`}
                      className="text-sm font-bold text-violet-300 transition hover:text-violet-200"
                    >
                      Open roadmap →
                    </Link>

                    <form action={deleteRoadmap}>
                      <input
                        type="hidden"
                        name="roadmapId"
                        value={roadmap.id}
                      />

                      <button
                        type="submit"
                        className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-200 transition hover:bg-rose-500/20 hover:text-white"
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
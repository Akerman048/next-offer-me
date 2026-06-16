import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import RoadmapWeekCard from "@/components/roadmaps/RoadmapWeekCard";

type Props = {
  params: Promise<{
    roadmapId: string;
  }>;
};

export default async function RoadmapPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { roadmapId } = await params;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  const roadmap = await prisma.roadmap.findFirst({
    where: {
      id: roadmapId,
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      createdAt: true,
      weeks: {
        orderBy: {
          weekNumber: "asc",
        },
        select: {
          id: true,
          weekNumber: true,
          title: true,
          goal: true,
          description: true,
          items: {
            select: {
              id: true,
              section: true,
              text: true,
              completed: true,
            },
          },
        },
      },
    },
  });

  if (!roadmap) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/roadmaps"
            className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Back to roadmaps
          </Link>

          <Link
            href="/interview"
            className="inline-flex items-center rounded-2xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-2xl shadow-violet-500/20 transition hover:-translate-y-0.5 hover:bg-violet-400"
          >
            Start new interview
            <span className="ml-2 text-lg">›</span>
          </Link>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute right-28 top-16 h-2 w-2 rounded-full bg-violet-400/30" />
          <div className="pointer-events-none absolute right-96 top-20 h-2 w-2 rounded-full bg-violet-400/30" />

          <div className="mb-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200">
            AI Learning Roadmap
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white md:text-6xl">
            {roadmap.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            This roadmap was generated from your weak interview answers. Use it
            as a focused learning plan before your next interview.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-background/50 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-400">Created</p>

              <p className="mt-2 font-bold text-white">
                {roadmap.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-background/50 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-400">Type</p>

              <p className="mt-2 font-bold text-white">
                Interview improvement
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-background/50 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-400">Focus</p>

              <p className="mt-2 font-bold text-white">Weak areas</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="flex items-center gap-3 text-3xl font-black text-white">
              <span className="text-violet-400">📅</span>
              Weekly plan
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Follow each week and complete the tasks step by step.
            </p>
          </div>

          <div className="space-y-6">
            {roadmap.weeks.map((week) => (
              <RoadmapWeekCard
                key={week.id}
                week={week}
                roadmapId={roadmap.id}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
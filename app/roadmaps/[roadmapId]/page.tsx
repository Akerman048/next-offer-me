import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import RoadmapColumn from "@/components/roadmaps/RoadmapColumn";

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
  });

const roadmap = await prisma.roadmap.findFirst({
  where: {
    id: roadmapId,
    userId: user.id,
  },
  include: {
    weeks: {
      orderBy: {
        weekNumber: "asc",
      },
      include: {
        items: true,
      },
    },
  },
});

  if (!roadmap) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/roadmaps"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            ← Back to roadmaps
          </Link>

          <Link
            href="/interview"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            Start new interview
          </Link>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="mb-4 inline-flex rounded-full bg-green-950 px-3 py-1 text-sm text-green-300">
            AI Learning Roadmap
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {roadmap.title}
          </h1>

          <p className="max-w-2xl text-slate-400">
            This roadmap was generated from your weak interview answers. Use it
            as a focused learning plan before your next interview.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-500">Created</p>
              <p className="mt-1 font-medium">
                {roadmap.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-500">Type</p>
              <p className="mt-1 font-medium">Interview improvement</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-500">Focus</p>
              <p className="mt-1 font-medium">Weak areas</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
         {roadmap.weeks.map((week) => {
  const completed = week.items.filter((item) => item.completed).length;
  const total = week.items.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const topics = week.items.filter((item) => item.section === "TOPICS");
  const practice = week.items.filter((item) => item.section === "PRACTICE");
  const project = week.items.filter((item) => item.section === "PROJECT");
  const interview = week.items.filter((item) => item.section === "INTERVIEW");

  return (
    <section
      key={week.id}
      className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-green-400">
            Week {week.weekNumber}
          </p>

          <h2 className="text-2xl font-bold text-white">
            {week.title}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {week.description}
          </p>
        </div>

        <div className="min-w-40">
          <p className="mb-2 text-sm text-slate-400">
            {completed} / {total} completed
          </p>

          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <RoadmapColumn
          title="Topics to review"
          items={topics}
          roadmapId={roadmap.id}
        />

        <RoadmapColumn
          title="Practice tasks"
          items={practice}
          roadmapId={roadmap.id}
        />

        <RoadmapColumn
          title="Mini project"
          items={project}
          roadmapId={roadmap.id}
        />

        <RoadmapColumn
          title="Before next interview"
          items={interview}
          roadmapId={roadmap.id}
        />
      </div>
    </section>
  );
})}
        </section>
      </div>
    </main>
  );
}
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
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/roadmaps"
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:bg-card-hover"
          >
            ← Back to roadmaps
          </Link>

          <Link
            href="/interview"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]"
          >
            Start new interview
          </Link>
        </div>

        <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-lg">
          <div className="mb-4 inline-flex rounded-full bg-success-light px-3 py-1 text-sm text-gray-100">
            AI Learning Roadmap
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {roadmap.title}
          </h1>

          <p className="max-w-2xl text-muted">
            This roadmap was generated from your weak interview answers. Use it
            as a focused learning plan before your next interview.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted">Created</p>

              <p className="mt-1 font-medium">
                {roadmap.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted">Type</p>

              <p className="mt-1 font-medium">Interview improvement</p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted">Focus</p>

              <p className="mt-1 font-medium">Weak areas</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {roadmap.weeks.map((week) => (
            <RoadmapWeekCard key={week.id} week={week} roadmapId={roadmap.id} />
          ))}
        </section>
      </div>
    </main>
  );
}

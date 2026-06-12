import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import BackButton from "@/components/ui/BackButton";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TopicPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { slug } = await params;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: {
          order: "asc",
        },
        include: {
          parts: {
            orderBy: {
              order: "asc",
            },
            include: {
              progress: {
                where: {
                  userId: user.id,
                  completed: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!topic) {
    notFound();
  }

  const totalLessons = topic.lessons.length;

  const completedLessons = topic.lessons.filter((lesson) => {
    const totalParts = lesson.parts.length;

    if (totalParts === 0) {
      return false;
    }

    const completedParts = lesson.parts.filter(
      (part) => part.progress.length > 0,
    ).length;

    return completedParts === totalParts;
  }).length;

  const totalParts = topic.lessons.reduce((sum, lesson) => {
    return sum + lesson.parts.length;
  }, 0);

  const completedParts = topic.lessons.reduce((sum, lesson) => {
    return (
      sum + lesson.parts.filter((part) => part.progress.length > 0).length
    );
  }, 0);

  const topicProgress =
    totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6">
          <BackButton text="← Back" />
        </div>

        <section className="relative mb-7 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute right-28 top-16 h-2 w-2 rounded-full bg-violet-400/30" />
          <div className="pointer-events-none absolute right-96 top-20 h-2 w-2 rounded-full bg-violet-400/30" />

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-violet-400">
            Topic
          </p>

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
                {topic.name}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Complete lessons step by step, review each part, and build a
                stronger interview foundation.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-background/50 p-6 shadow-2xl backdrop-blur-xl lg:min-w-72">
              <p className="text-sm font-medium text-slate-400">
                Topic progress
              </p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <h2 className="text-5xl font-black text-white">
                  {topicProgress}%
                </h2>

                <p className="pb-2 text-sm text-slate-400">
                  {completedParts} / {totalParts} parts
                </p>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                  style={{
                    width: `${topicProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-7 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-3xl text-violet-300">
                📚
              </div>

              <div>
                <p className="text-sm text-slate-300">Lessons completed</p>
                <h2 className="mt-1 text-4xl font-black text-white">
                  {completedLessons}/{totalLessons}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-3xl text-blue-300">
                🧩
              </div>

              <div>
                <p className="text-sm text-slate-300">Completed parts</p>
                <h2 className="mt-1 text-4xl font-black text-white">
                  {completedParts}/{totalParts}
                </h2>
              </div>
            </div>
          </div>

          <Link
            href="/interview"
            className="group relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-violet-500 p-6 text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 hover:bg-violet-400"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />

            <p className="relative text-sm font-medium text-violet-100">
              Ready to test?
            </p>

            <h2 className="relative mt-3 text-3xl font-black">
              Start interview
              <span className="ml-2 transition group-hover:ml-4">›</span>
            </h2>
          </Link>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-3 text-3xl font-black text-white">
                <span className="text-violet-400">📖</span>
                Lessons
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Follow the lesson order and complete every part.
              </p>
            </div>

            <span className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 backdrop-blur-xl">
              {totalLessons} lessons
            </span>
          </div>

          {topic.lessons.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-3xl text-violet-300">
                📭
              </div>

              <h3 className="mt-6 text-2xl font-black text-white">
                No lessons yet
              </h3>

              <p className="mt-3 text-sm text-slate-400">
                No lessons have been added to this topic yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topic.lessons.map((lesson, index) => {
                const lessonTotalParts = lesson.parts.length;

                const lessonCompletedParts = lesson.parts.filter(
                  (part) => part.progress.length > 0,
                ).length;

                const lessonProgress =
                  lessonTotalParts > 0
                    ? Math.round(
                        (lessonCompletedParts / lessonTotalParts) * 100,
                      )
                    : 0;

                return (
                  <Link
                    key={lesson.id}
                    href={`/topics/${topic.slug}/${lesson.slug}`}
                    className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card-hover"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20" />

                    <div className="relative">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-xl font-black text-violet-300">
                          {index + 1}
                        </div>

                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                          {lessonProgress}%
                        </span>
                      </div>

                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                        Lesson
                      </p>

                      <h3 className="text-2xl font-black text-white transition group-hover:text-violet-200">
                        {lesson.title}
                      </h3>

                      {lesson.description && (
                        <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-400">
                          {lesson.description}
                        </p>
                      )}

                      <p className="mt-5 text-sm text-slate-400">
                        {lessonCompletedParts} / {lessonTotalParts} parts
                        completed
                      </p>

                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                          style={{
                            width: `${lessonProgress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-sm font-bold text-slate-200">
                          Open lesson
                        </span>

                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/30 text-xl text-violet-200 transition group-hover:bg-violet-500 group-hover:text-white">
                          ›
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
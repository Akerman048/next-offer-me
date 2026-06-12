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
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <BackButton text="← Back" />
        </div>

        <section className="mb-8 rounded-3xl border border-border bg-card p-8 shadow-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-muted">
            Topic
          </p>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">
                {topic.name}
              </h1>

              <p className="mt-4 max-w-2xl text-muted">
                Complete lessons step by step, review each part, and build a
                stronger interview foundation.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5 lg:min-w-64">
              <p className="text-sm text-muted">Topic progress</p>

              <div className="mt-2 flex items-end justify-between gap-4">
                <h2 className="text-4xl font-bold">{topicProgress}%</h2>

                <p className="pb-1 text-sm text-muted">
                  {completedParts} / {totalParts} parts
                </p>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-success"
                  style={{
                    width: `${topicProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Lessons completed</p>

            <h2 className="mt-2 text-4xl font-bold">
              {completedLessons}/{totalLessons}
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Completed parts</p>

            <h2 className="mt-2 text-4xl font-bold">
              {completedParts}/{totalParts}
            </h2>
          </div>

          <Link
            href="/interview"
            className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground transition hover:scale-[1.02]"
          >
            <p className="text-sm font-medium opacity-70">Ready to test?</p>

            <h2 className="mt-2 text-2xl font-bold">Start interview →</h2>
          </Link>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Lessons</h2>

              <p className="mt-1 text-sm text-muted">
                Follow the lesson order and complete every part.
              </p>
            </div>

            <span className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted">
              {totalLessons} lessons
            </span>
          </div>

          {topic.lessons.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-muted">
                No lessons have been added to this topic yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topic.lessons.map((lesson) => {
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
                    className="group rounded-2xl border border-border bg-card p-6 shadow-lg transition hover:-translate-y-1 hover:bg-card-hover"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gray-400">
                          Lesson
                        </p>

                        <h3 className="text-xl font-semibold">
                          {lesson.title}
                        </h3>
                      </div>

                      <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm text-gray-200">
                        {lessonProgress}%
                      </span>
                    </div>

                    {lesson.description && (
                      <p className="mb-5 line-clamp-3 text-sm text-muted">
                        {lesson.description}
                      </p>
                    )}

                    <p className="mb-3 text-sm text-muted">
                      {lessonCompletedParts} / {lessonTotalParts} parts
                      completed
                    </p>

                    <div className="h-3 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{
                          width: `${lessonProgress}%`,
                        }}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-200">
                        Open lesson
                      </span>

                      <span className="rounded-full bg-secondary px-3 py-1 text-sm transition group-hover:bg-primary group-hover:text-primary-foreground">
                        →
                      </span>
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
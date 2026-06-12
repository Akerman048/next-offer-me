import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const topics = await prisma.topic.findMany({
    include: {
      lessons: {
        include: {
          parts: {
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
    orderBy: {
      name: "asc",
    },
  });

  const weakAnswers = await prisma.userAnswer.findMany({
    where: {
      userId: user.id,
      aiScore: {
        lt: 8,
      },
    },
    include: {
      question: {
        include: {
          lessonPart: {
            include: {
              lesson: {
                include: {
                  topic: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const latestRoadmap = await prisma.roadmap.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getTopicParts = (topic: (typeof topics)[number]) => {
    return topic.lessons.flatMap((lesson) => lesson.parts);
  };

  const totalParts = topics.reduce((sum, topic) => {
    return sum + getTopicParts(topic).length;
  }, 0);

  const completedParts = topics.reduce((sum, topic) => {
    const parts = getTopicParts(topic);

    return sum + parts.filter((part) => part.progress.length > 0).length;
  }, 0);

  const overallProgress =
    totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;

  const startedTopics = topics.filter((topic) => {
    const parts = getTopicParts(topic);

    return parts.some((part) => part.progress.length > 0);
  });

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-3xl border border-border bg-card p-8 shadow-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-muted">
            Learning dashboard
          </p>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">
                Welcome back 👋
              </h1>

              <p className="mt-4 max-w-2xl text-muted">
                Track your lessons, review weak answers, and continue your AI
                roadmap.
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
            <p className="text-sm text-muted">Overall progress</p>

            <h2 className="mt-2 text-4xl font-bold">{overallProgress}%</h2>

            <p className="mt-2 text-sm text-muted">
              {completedParts} / {totalParts} lesson parts completed
            </p>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-success"
                style={{
                  width: `${overallProgress}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Started topics</p>

            <h2 className="mt-2 text-4xl font-bold">{startedTopics.length}</h2>

            <p className="mt-2 text-sm text-muted">
              Topics with at least one completed part
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Weak answers</p>

            <h2 className="mt-2 text-4xl font-bold">{weakAnswers.length}</h2>

            <p className="mt-2 text-sm text-muted">
              Answers below 8/10 that need review
            </p>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Your topics</h2>

              <p className="mt-1 text-sm text-muted">
                Continue from where you stopped.
              </p>
            </div>

            <Link
              href="/topics"
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:bg-card-hover"
            >
              View all topics
            </Link>
          </div>

          {startedTopics.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-muted">You have not started any topic yet.</p>

              <Link
                href="/topics"
                className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
              >
                Start learning
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {startedTopics.map((topic) => {
                const parts = getTopicParts(topic);

                const completed = parts.filter(
                  (part) => part.progress.length > 0,
                ).length;

                const total = parts.length;

                const topicProgress =
                  total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className="group rounded-2xl border border-border bg-card p-6 shadow-lg transition hover:-translate-y-1 hover:bg-card-hover"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold">{topic.name}</h3>

                        <p className="mt-1 text-sm text-muted">
                          {completed} of {total} parts completed
                        </p>
                      </div>

                      <span className="rounded-full bg-secondary px-3 py-1 text-sm text-gray-200">
                        {topicProgress}%
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{
                          width: `${topicProgress}%`,
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-3xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Weak answers</h2>

              <p className="mt-1 text-sm text-muted">
                Review these answers to improve your interview score.
              </p>
            </div>
          </div>

          {weakAnswers.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-muted">
                No weak answers yet. Complete an interview to get personalized
                feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {weakAnswers.map((answer) => {
                if (!answer.question) return null;

                const part = answer.question.lessonPart;
                const lesson = part.lesson;
                const topic = lesson.topic;

                return (
                  <article
                    key={answer.id}
                    className="rounded-2xl border border-border bg-background p-5 transition hover:bg-card-hover"
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {answer.question.title}
                        </h3>

                        <p className="mt-1 text-sm text-muted">
                          {topic.name} / {lesson.title} / {part.title}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-danger-light px-3 py-1 text-sm font-medium text-gray-100">
                        {answer.aiScore}/10
                      </span>
                    </div>

                    {answer.aiFeedback && (
                      <p className="mb-4 line-clamp-2 text-sm text-muted">
                        {answer.aiFeedback}
                      </p>
                    )}

                    <Link
                      href={`/topics/${topic.slug}/${lesson.slug}/${part.id}`}
                      className="inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition"
                    >
                      Review lesson
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Your AI Roadmap</h2>

              <p className="mt-1 text-sm text-muted">
                Personalized plan based on your weak interview answers.
              </p>
            </div>

            <Link
              href="/roadmaps"
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:bg-card-hover"
            >
              View all
            </Link>
          </div>

          {!latestRoadmap ? (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm text-muted">
                You do not have a roadmap yet. Complete an interview and
                generate your first AI roadmap.
              </p>

              <Link
                href="/interview"
                className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition"
              >
                Start interview
              </Link>
            </div>
          ) : (
            <Link
              href={`/roadmaps/${latestRoadmap.id}`}
              className="block rounded-2xl border border-border bg-background p-5 transition hover:-translate-y-1 hover:bg-card-hover"
            >
              <h3 className="mb-2 text-xl font-semibold">
                {latestRoadmap.title}
              </h3>

              <p className="line-clamp-3 text-sm text-muted">
                {latestRoadmap.summary ??
                  "Personalized roadmap based on your weak interview answers."}
              </p>

              <p className="mt-4 text-xs text-gray-400">
                Created {latestRoadmap.createdAt.toLocaleDateString()}
              </p>
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
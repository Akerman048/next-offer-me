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
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <section className="relative mb-6 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute right-28 top-16 h-2 w-2 rounded-full bg-violet-400/30" />
          <div className="pointer-events-none absolute right-96 top-20 h-2 w-2 rounded-full bg-violet-400/30" />

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-violet-400">
            Learning dashboard
          </p>

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
                Welcome back 👋
              </h1>

              <p className="mt-5 max-w-2xl text-base text-slate-300">
                Track your lessons, review weak answers, and continue your AI
                roadmap.
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
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-3xl text-blue-400">
                📈
              </div>

              <div>
                <p className="text-sm text-slate-300">Overall progress</p>
                <h2 className="mt-1 text-4xl font-black text-white">
                  {overallProgress}%
                </h2>
              </div>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                style={{
                  width: `${overallProgress}%`,
                }}
              />
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {completedParts} / {totalParts} lesson parts completed
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-3xl text-violet-400">
                📖
              </div>

              <div>
                <p className="text-sm text-slate-300">Started topics</p>
                <h2 className="mt-1 text-4xl font-black text-white">
                  {startedTopics.length}
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Topics with at least one completed part
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/15 text-3xl text-orange-400">
                ⚠️
              </div>

              <div>
                <p className="text-sm text-slate-300">Weak answers</p>
                <h2 className="mt-1 text-4xl font-black text-white">
                  {weakAnswers.length}
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Answers below 8/10 that need review
            </p>
          </div>
        </section>

        <section className="mb-7 grid gap-6 lg:grid-cols-[0.9fr_1fr]">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-3 text-2xl font-black text-white">
                  <span className="text-violet-400">📘</span>
                  Your topics
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Continue from where you stopped.
                </p>
              </div>
            </div>

            {startedTopics.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
                <p className="text-slate-400">
                  You have not started any topic yet.
                </p>

                <Link
                  href="/topics"
                  className="mt-5 inline-flex rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400"
                >
                  Start learning
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
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
                      className="group flex items-center justify-between gap-5 rounded-[24px] border border-white/10 bg-card p-5 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card-hover"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-black text-slate-950">
                          JS
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {topic.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            {completed} of {total} parts completed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-slate-800 sm:block">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                            style={{
                              width: `${topicProgress}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-bold text-white">
                          {topicProgress}%
                        </span>

                        <span className="text-3xl text-slate-500 transition group-hover:text-white">
                          ›
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-3 text-2xl font-black text-white">
                  <span className="text-pink-500">⚠</span>
                  Weak answers
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Review these answers to improve your interview score.
                </p>
              </div>

              <Link
                href="/topics"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View all topics <span className="ml-2">›</span>
              </Link>
            </div>

            {weakAnswers.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
                <p className="text-slate-400">
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
                      className="rounded-[24px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl transition hover:bg-card-hover"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {answer.question.title}
                          </h3>

                          <p className="mt-2 text-sm text-slate-400">
                            {topic.name} / {lesson.title} / {part.title}
                          </p>
                        </div>

                        <span className="shrink-0 text-3xl font-black text-pink-500">
                          {answer.aiScore}/10
                        </span>
                      </div>

                      {answer.aiFeedback && (
                        <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-400">
                          {answer.aiFeedback}
                        </p>
                      )}

                      <Link
                        href={`/topics/${topic.slug}/${lesson.slug}/${part.id}`}
                        className="inline-flex rounded-2xl bg-violet-600/40 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-violet-600/60"
                      >
                        Review lesson
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-black text-white">
                <span className="text-emerald-400">🗺️</span>
                Your AI Roadmap
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Personalized plan based on your weak interview answers.
              </p>
            </div>

            <Link
              href="/roadmaps"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View all roadmap <span className="ml-2">›</span>
            </Link>
          </div>

          {!latestRoadmap ? (
            <div className="rounded-[24px] border border-white/10 bg-background/60 p-6">
              <p className="text-sm text-slate-400">
                You do not have a roadmap yet. Complete an interview and
                generate your first AI roadmap.
              </p>

              <Link
                href="/interview"
                className="mt-5 inline-flex rounded-2xl bg-violet-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
              >
                Start interview
              </Link>
            </div>
          ) : (
            <Link
              href={`/roadmaps/${latestRoadmap.id}`}
              className="group relative block overflow-hidden rounded-[24px] border border-white/10 bg-background/60 p-8 transition hover:-translate-y-1 hover:bg-card-hover"
            >
              <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-96 rounded-full bg-gradient-to-r from-violet-500/20 via-emerald-500/20 to-emerald-400/30 blur-2xl" />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-5xl">
                  ⛳
                </div>

                <div className="max-w-3xl">
                  <h3 className="text-xl font-black text-white">
                    {latestRoadmap.title}
                  </h3>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
                    {latestRoadmap.summary ??
                      "Personalized roadmap based on your weak interview answers."}
                  </p>

                  <p className="mt-5 inline-flex rounded-xl bg-white/5 px-4 py-2 text-xs text-slate-400">
                    📅 Created {latestRoadmap.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="ml-auto hidden text-5xl md:block">🏁</div>
              </div>
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
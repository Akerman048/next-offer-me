import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

import MarkdownContent from "@/components/ui/MarkdownContent";
import AnswerForm from "@/components/question/AnswerForm";
import AnswersList from "@/components/question/AnswersList";
import { completePartAndRedirect } from "./actions";

type Props = {
  params: Promise<{
    slug: string;
    lessonSlug: string;
    partId: string;
  }>;
};

export default async function LessonPartPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { slug, lessonSlug, partId } = await params;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  const part = await prisma.lessonPart.findUnique({
    where: {
      id: partId,
    },
    select: {
      id: true,
      title: true,
      content: true,
      lesson: {
        select: {
          id: true,
          title: true,
          slug: true,
          topic: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          parts: {
            orderBy: {
              order: "asc",
            },
            select: {
              id: true,
              title: true,
              progress: {
                where: {
                  userId: user.id,
                  completed: true,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      questions: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          title: true,
          prompt: true,
          order: true,
        },
      },
    },
  });

  if (
    !part ||
    part.lesson.slug !== lessonSlug ||
    part.lesson.topic.slug !== slug
  ) {
    notFound();
  }

  const { lesson, questions } = part;
  const { topic, parts } = lesson;

  const currentIndex = parts.findIndex((item) => item.id === part.id);
  const nextPart = parts[currentIndex + 1];

  const totalParts = parts.length;
  const completedParts = parts.filter((item) => item.progress.length > 0).length;

  const progress =
    totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;

  const currentPath = `/topics/${slug}/${lessonSlug}/${part.id}`;

  const nextPath = nextPart
    ? `/topics/${slug}/${lessonSlug}/${nextPart.id}`
    : `/topics/${slug}`;

  const questionIds = questions.map((question) => question.id);

  const answers = await prisma.userAnswer.findMany({
    where: {
      userId: user.id,
      questionId: {
        in: questionIds,
      },
    },
    select: {
      id: true,
      questionId: true,
      answerText: true,
      aiFeedback: true,
      aiScore: true,
      aiRoadmap: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background px-3 py-6 text-foreground sm:px-4 sm:py-8">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
        <aside className="min-w-0 h-fit rounded-[28px] border border-white/10 bg-card p-4 shadow-2xl backdrop-blur-xl sm:p-5 lg:sticky lg:top-8">
          <Link
            href={`/topics/${slug}`}
            className="mb-6 inline-flex max-w-full items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span className="truncate">← Back to {topic.name}</span>
          </Link>

          <div className="mb-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-violet-400">
              Lesson
            </p>

            <h2 className="break-words text-2xl font-black leading-tight text-white">
              {lesson.title}
            </h2>
          </div>

          <div className="mb-6 rounded-[24px] border border-white/10 bg-background/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">Progress</span>

              <span className="text-sm font-bold text-white">
                {completedParts} / {totalParts}
              </span>
            </div>

            <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="text-5xl font-black text-white">{progress}%</p>
          </div>

          <div className="space-y-2">
            {parts.map((item, index) => {
              const isActive = item.id === part.id;
              const isCompleted = item.progress.length > 0;

              return (
                <Link
                  key={item.id}
                  href={`/topics/${slug}/${lessonSlug}/${item.id}`}
                  className={[
                    "flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                    isActive
                      ? "border-violet-400/30 bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-black",
                      isActive
                        ? "bg-white text-violet-600"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-800 text-slate-400",
                    ].join(" ")}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </span>

                  <span className="min-w-0 break-words line-clamp-2">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0">
          <section className="mb-8 min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-card shadow-2xl backdrop-blur-xl sm:rounded-[32px]">
            <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] px-4 py-6 sm:px-6 md:px-8 md:py-8">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-violet-400/10" />

              <p className="mb-3 break-words text-sm font-semibold text-slate-300">
                {topic.name} / {lesson.title}
              </p>

              <h1 className="break-words text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                {part.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Read the material, answer the practice questions, and continue
                when you feel confident.
              </p>
            </div>

            <div className="prose prose-invert max-w-none min-w-0 bg-background/60 p-4 text-slate-200 sm:p-6 md:p-8">
              <MarkdownContent content={part.content} />
            </div>
          </section>

          {questions.length > 0 && (
            <section className="mb-8 min-w-0 rounded-[28px] border border-white/10 bg-card p-4 shadow-2xl backdrop-blur-xl sm:rounded-[32px] sm:p-6 md:p-8">
              <div className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-violet-400">
                  Practice
                </p>

                <h2 className="break-words text-3xl font-black text-white sm:text-4xl">
                  Practice questions
                </h2>

                <p className="mt-3 text-sm text-slate-400">
                  Write your answer, then use AI feedback to improve it.
                </p>
              </div>

              <div className="space-y-6">
                {questions.map((question, index) => {
                  const questionAnswers = answers.filter(
                    (answer) => answer.questionId === question.id,
                  );

                  return (
                    <article
                      key={question.id}
                      className="min-w-0 rounded-[24px] border border-white/10 bg-background/60 p-4 shadow-xl transition hover:bg-card-hover sm:rounded-[28px] sm:p-5 md:p-6"
                    >
                      <div className="mb-5 flex items-start gap-4">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-sm font-black text-white shadow-lg shadow-violet-500/25">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-violet-400">
                            Question
                          </p>

                          <h3 className="break-words text-2xl font-black text-white">
                            {question.title}
                          </h3>
                        </div>
                      </div>

                      <div className="prose prose-invert mb-6 max-w-none min-w-0 text-slate-300">
                        <MarkdownContent content={question.prompt} />
                      </div>

                      <div className="min-w-0 rounded-[20px] border border-white/10 bg-card/70 p-4 sm:rounded-[24px] sm:p-5">
                        <AnswerForm
                          questionId={question.id}
                          questionText={question.prompt}
                          path={currentPath}
                        />
                      </div>

                      <div className="mt-5">
                        <AnswersList
                          answers={questionAnswers}
                          path={currentPath}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <form action={completePartAndRedirect} className="pb-8">
            <input type="hidden" name="partId" value={part.id} />
            <input type="hidden" name="nextPath" value={nextPath} />
            <input type="hidden" name="currentPath" value={currentPath} />

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 rounded-[28px] bg-violet-500 px-6 py-5 text-lg font-black text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 hover:bg-violet-400"
            >
              {nextPart ? "Continue to next part" : "Finish lesson"}

              <span className="text-2xl transition group-hover:translate-x-1">
                {nextPart ? "›" : "✓"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

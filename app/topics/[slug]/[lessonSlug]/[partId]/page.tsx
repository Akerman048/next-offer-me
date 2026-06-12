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
  });

  const part = await prisma.lessonPart.findUnique({
    where: {
      id: partId,
    },
    include: {
      lesson: {
        include: {
          topic: true,
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
      questions: {
        orderBy: {
          order: "asc",
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-border bg-card p-5 shadow-xl lg:sticky lg:top-8">
          <Link
            href={`/topics/${slug}`}
            className="mb-6 inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-card-hover hover:text-foreground"
          >
            ← Back to {topic.name}
          </Link>

          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
              Lesson
            </p>

            <h2 className="text-xl font-bold leading-tight">{lesson.title}</h2>
          </div>

          <div className="mb-6 rounded-2xl bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted">Progress</span>
              <span className="text-sm font-semibold">
                {completedParts} / {totalParts}
              </span>
            </div>

            <div className="mb-3 h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="text-3xl font-black">{progress}%</p>
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
                    "flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-card-hover",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : isCompleted
                          ? "bg-success text-white"
                          : "bg-secondary text-muted",
                    ].join(" ")}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </span>

                  <span className="line-clamp-2">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        <div>
          <section className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
            <div className="border-b border-border bg-card-hover/40 px-8 py-6">
              <p className="mb-3 text-sm font-medium text-muted">
                {topic.name} / {lesson.title}
              </p>

              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                {part.title}
              </h1>

              <p className="mt-4 max-w-2xl text-muted">
                Read the material, answer the practice questions, and continue
                when you feel confident.
              </p>
            </div>

            <div className="bg-primary p-6 text-primary-foreground md:p-8">
              <MarkdownContent content={part.content} />
            </div>
          </section>

          {questions.length > 0 && (
            <section className="mb-8 rounded-[2rem] border border-border bg-card p-6 shadow-xl md:p-8">
              <div className="mb-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                  Practice
                </p>

                <h2 className="text-3xl font-black">Practice questions</h2>

                <p className="mt-2 text-muted">
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
                      className="rounded-3xl border border-border bg-background p-5 shadow-sm md:p-6"
                    >
                      <div className="mb-5 flex items-start gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground">
                          {index + 1}
                        </span>

                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                            Question
                          </p>

                          <h3 className="text-xl font-bold">
                            {question.title}
                          </h3>
                        </div>
                      </div>

                      <div className="">
                        <MarkdownContent content={question.prompt} />
                      </div>

                      <AnswerForm
                        questionId={question.id}
                        questionText={question.prompt}
                        path={currentPath}
                      />

                      <AnswersList answers={questionAnswers} path={currentPath} />
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
              className="group flex w-full items-center justify-center gap-2 rounded-3xl bg-primary px-6 py-5 text-lg font-black text-primary-foreground shadow-xl transition hover:scale-[1.01] hover:shadow-2xl"
            >
              {nextPart ? "Continue to next part" : "Finish lesson"}
              <span className="transition group-hover:translate-x-1">
                {nextPart ? "→" : "✓"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
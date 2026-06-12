import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { finishInterview } from "./actions";
import MarkdownContent from "@/components/ui/MarkdownContent";
import InterviewAnswerForm from "@/components/interview/InterviewAnswerForm";

type Props = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function InterviewSessionPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { sessionId } = await params;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const interview = await prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId: user.id,
    },
    include: {
      answers: {
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
          createdAt: "asc",
        },
      },
    },
  });

  if (!interview) {
    notFound();
  }

  const currentIndex = interview.answers.findIndex(
    (answer) => !answer.answerText?.trim(),
  );

  const currentAnswer =
    currentIndex === -1 ? null : interview.answers[currentIndex];

  const answeredCount = interview.answers.filter((answer) =>
    answer.answerText?.trim(),
  ).length;

  const progress = Math.round((answeredCount / interview.answers.length) * 100);

  if (!currentAnswer) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground">
        <div className="mx-auto max-w-3xl">
          <section className="rounded-3xl border border-border bg-card p-8 shadow-2xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-muted">
              Interview completed
            </p>

            <h1 className="mb-4 text-4xl font-bold">
              Interview completed 🎉
            </h1>

            <p className="mb-6 text-muted">
              You answered all questions. Open your result to review your score,
              feedback, and weak areas.
            </p>

            <form action={finishInterview}>
              <input type="hidden" name="sessionId" value={interview.id} />

              <button className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02]">
                View result
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const question = currentAnswer.question;
  const topic = question.lessonPart.lesson.topic;
  const lesson = question.lessonPart.lesson;
  const part = question.lessonPart;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/interview"
          className="mb-6 inline-block rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:bg-card-hover"
        >
          ← Exit interview
        </Link>

        <section className="mb-8 rounded-3xl border border-border bg-card p-5 shadow-xl">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="font-semibold">
              Question {answeredCount + 1} / {interview.answers.length}
            </p>

            <p className="font-semibold">{progress}%</p>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-xl">
          <p className="mb-2 text-sm text-muted">
            {topic.name} / {lesson.title} / {part.title}
          </p>

          <h1 className="mb-6 text-3xl font-bold">{question.title}</h1>

          <div className="rounded-2xl border border-border bg-background p-5">
            <MarkdownContent content={question.prompt} />
          </div>
        </section>

        <InterviewAnswerForm
          interviewAnswerId={currentAnswer.id}
          sessionId={interview.id}
          secondsLimit={
            interview.mode === "HARD"
              ? 60
              : interview.mode === "REAL"
                ? 90
                : 0
          }
        />
      </div>
    </main>
  );
}
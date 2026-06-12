import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { generateRoadmap } from "./actions";
import AutoEvaluateAnswers from "@/components/interview/AutoEvaluateAnswers";

type Props = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function InterviewResultPage({ params }: Props) {
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
      },
    },
  });

  if (!interview) {
    notFound();
  }

  const pendingAnswers = interview.answers.filter(
    (answer) =>
      answer.evaluationStatus === "PENDING" ||
      answer.evaluationStatus === "PROCESSING",
  );

  const completedAnswers = interview.answers.filter(
    (answer) => answer.evaluationStatus === "COMPLETED",
  );

  const failedAnswers = interview.answers.filter(
    (answer) => answer.evaluationStatus === "FAILED",
  );

  const scores = interview.answers
    .map((answer) => answer.aiScore)
    .filter((score): score is number => score !== null);

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        )
      : 0;

  const weakAnswers = interview.answers.filter(
    (answer) => answer.aiScore !== null && answer.aiScore < 8,
  );

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <AutoEvaluateAnswers
          sessionId={interview.id}
          hasPendingAnswers={pendingAnswers.length > 0}
        />

        <section className="mb-8 rounded-3xl border border-border bg-card p-8 shadow-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-muted">
            Interview summary
          </p>

          <h1 className="mb-4 text-4xl font-bold">Interview Result</h1>

          <p className="text-xl text-muted">
            Average score:{" "}
            <span className="font-bold text-foreground">{averageScore}/10</span>
          </p>
        </section>

        {pendingAnswers.length > 0 && (
          <div className="mb-8 rounded-2xl border border-warning bg-warning-light p-4 text-gray-100">
            AI is still evaluating {pendingAnswers.length} answer(s). Refresh
            this page in a few seconds.
          </div>
        )}

        {failedAnswers.length > 0 && (
          <div className="mb-8 rounded-2xl border border-danger bg-danger-light p-4 text-gray-100">
            {failedAnswers.length} answer(s) failed to evaluate. You can run the
            evaluation job again.
          </div>
        )}

        {pendingAnswers.length === 0 && completedAnswers.length > 0 && (
          <form action={generateRoadmap} className="mb-8">
            <input type="hidden" name="sessionId" value={interview.id} />

            <button
              type="submit"
              className="rounded-xl bg-success px-5 py-3 font-semibold text-gray-100 transition hover:scale-[1.02]"
            >
              Generate roadmap
            </button>
          </form>
        )}

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">Answers</h2>

          <div className="space-y-4">
            {interview.answers.map((answer) => {
              const question = answer.question;
              const part = question.lessonPart;
              const lesson = part.lesson;
              const topic = lesson.topic;

              return (
                <article
                  key={answer.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{question.title}</h3>

                      <p className="mt-1 text-sm text-muted">
                        {topic.name} / {lesson.title} / {part.title}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm text-gray-100">
                      {answer.evaluationStatus === "COMPLETED"
                        ? `${answer.aiScore ?? 0}/10`
                        : answer.evaluationStatus === "FAILED"
                          ? "Failed"
                          : "Evaluating..."}
                    </span>
                  </div>

                  {answer.evaluationStatus === "COMPLETED" && (
                    <div className="grid gap-2 sm:grid-cols-4">
                      <p className="rounded-xl bg-secondary p-2 text-sm text-gray-100">
                        Accuracy: {answer.technicalAccuracy ?? 0}/10
                      </p>

                      <p className="rounded-xl bg-secondary p-2 text-sm text-gray-100">
                        Clarity: {answer.clarity ?? 0}/10
                      </p>

                      <p className="rounded-xl bg-secondary p-2 text-sm text-gray-100">
                        Complete: {answer.completeness ?? 0}/10
                      </p>

                      <p className="rounded-xl bg-secondary p-2 text-sm text-gray-100">
                        Style: {answer.interviewStyle ?? 0}/10
                      </p>
                    </div>
                  )}

                  {answer.timeSpentSeconds !== null && (
                    <p className="mt-3 text-sm text-muted">
                      Time spent: {answer.timeSpentSeconds}s
                    </p>
                  )}

                  <details className="mt-4 rounded-2xl border border-border bg-background p-4">
                    <summary className="cursor-pointer font-medium">
                      View detailed feedback
                    </summary>

                    <div className="mt-4 space-y-4">
                      {answer.aiFeedback && (
                        <div>
                          <h4 className="mb-1 font-semibold">Feedback</h4>

                          <p className="text-sm text-muted">
                            {answer.aiFeedback}
                          </p>
                        </div>
                      )}

                      {answer.improvedAnswer && (
                        <div className="rounded-xl bg-success-light p-4">
                          <h4 className="mb-2 font-semibold text-gray-100">
                            Improved answer
                          </h4>

                          <p className="text-sm text-gray-100">
                            {answer.improvedAnswer}
                          </p>
                        </div>
                      )}

                      {answer.missingConcepts && (
                        <div className="rounded-xl bg-danger-light p-4">
                          <h4 className="mb-2 font-semibold text-gray-100">
                            Missing concepts
                          </h4>

                          <p className="text-sm text-gray-100">
                            {answer.missingConcepts}
                          </p>
                        </div>
                      )}

                      <Link
                        href={`/topics/${topic.slug}/${lesson.slug}/${part.id}`}
                        className="inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
                      >
                        Review lesson
                      </Link>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Weak Areas</h2>

          {weakAnswers.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-muted">No weak areas. Good job 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weakAnswers.map((answer) => {
                const part = answer.question.lessonPart;
                const lesson = part.lesson;
                const topic = lesson.topic;

                return (
                  <Link
                    key={answer.id}
                    href={`/topics/${topic.slug}/${lesson.slug}/${part.id}`}
                    className="block rounded-2xl border border-border bg-card p-5 transition hover:bg-card-hover"
                  >
                    <p className="text-sm text-muted">
                      {topic.name} / {lesson.title}
                    </p>

                    <h3 className="text-lg font-semibold">{part.title}</h3>

                    <p className="text-sm text-danger">
                      Score: {answer.aiScore}/10
                    </p>
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
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
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <AutoEvaluateAnswers
          sessionId={interview.id}
          hasPendingAnswers={pendingAnswers.length > 0}
        />

        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute right-28 top-16 h-2 w-2 rounded-full bg-violet-400/30" />

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-violet-400">
            Interview summary
          </p>

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
                Interview Result
              </h1>

              <p className="mt-5 text-base text-slate-300">
                Your interview performance, feedback, weak areas and next steps.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-background/50 p-6 shadow-2xl backdrop-blur-xl md:min-w-56">
              <p className="text-sm text-slate-400">Average score</p>

              <h2 className="mt-2 text-6xl font-black text-white">
                {averageScore}
                <span className="text-2xl text-slate-400">/10</span>
              </h2>
            </div>
          </div>
        </section>

        {pendingAnswers.length > 0 && (
          <div className="mb-8 rounded-[24px] border border-yellow-400/20 bg-yellow-500/10 p-5 text-sm font-semibold text-yellow-100 shadow-2xl backdrop-blur-xl">
            AI is still evaluating {pendingAnswers.length} answer(s). Refresh
            this page in a few seconds.
          </div>
        )}

        {failedAnswers.length > 0 && (
          <div className="mb-8 rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm font-semibold text-rose-100 shadow-2xl backdrop-blur-xl">
            {failedAnswers.length} answer(s) failed to evaluate. You can run the
            evaluation job again.
          </div>
        )}

        {pendingAnswers.length === 0 && completedAnswers.length > 0 && (
          <form action={generateRoadmap} className="mb-8">
            <input type="hidden" name="sessionId" value={interview.id} />

            <button
              type="submit"
              className="group flex items-center justify-center gap-3 rounded-[24px] bg-emerald-500 px-6 py-4 text-sm font-black text-white shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-1 hover:bg-emerald-400"
            >
              Generate roadmap
              <span className="text-xl transition group-hover:translate-x-1">
                ›
              </span>
            </button>
          </form>
        )}

        <section className="mb-10">
          <div className="mb-6">
            <h2 className="flex items-center gap-3 text-3xl font-black text-white">
              <span className="text-violet-400">🧠</span>
              Answers
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Review each answer and see how AI evaluated your performance.
            </p>
          </div>

          <div className="space-y-5">
            {interview.answers.map((answer) => {
              const question = answer.question;
              const part = question.lessonPart;
              const lesson = part.lesson;
              const topic = lesson.topic;

              const isCompleted = answer.evaluationStatus === "COMPLETED";
              const isFailed = answer.evaluationStatus === "FAILED";

              return (
                <article
                  key={answer.id}
                  className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {question.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {topic.name} / {lesson.title} / {part.title}
                      </p>
                    </div>

                    <span
                      className={[
                        "shrink-0 rounded-2xl px-4 py-2 text-sm font-black",
                        isCompleted
                          ? "bg-violet-500/20 text-violet-200"
                          : isFailed
                            ? "bg-rose-500/20 text-rose-200"
                            : "bg-yellow-500/20 text-yellow-200",
                      ].join(" ")}
                    >
                      {isCompleted
                        ? `${answer.aiScore ?? 0}/10`
                        : isFailed
                          ? "Failed"
                          : "Evaluating..."}
                    </span>
                  </div>

                  {isCompleted && (
                    <div className="grid gap-3 sm:grid-cols-4">
                      <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-slate-200">
                        Accuracy: {answer.technicalAccuracy ?? 0}/10
                      </p>

                      <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-slate-200">
                        Clarity: {answer.clarity ?? 0}/10
                      </p>

                      <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-slate-200">
                        Complete: {answer.completeness ?? 0}/10
                      </p>

                      <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-slate-200">
                        Style: {answer.interviewStyle ?? 0}/10
                      </p>
                    </div>
                  )}

                  {answer.timeSpentSeconds !== null && (
                    <p className="mt-4 text-sm text-slate-400">
                      ⏱ Time spent: {answer.timeSpentSeconds}s
                    </p>
                  )}

                  <details className="mt-5 rounded-[24px] border border-white/10 bg-background/60 p-5">
                    <summary className="cursor-pointer text-sm font-bold text-white">
                      View detailed feedback
                    </summary>

                    <div className="mt-5 space-y-5">
                      {answer.aiFeedback && (
                        <div>
                          <h4 className="mb-2 font-bold text-white">
                            Feedback
                          </h4>

                          <p className="text-sm leading-6 text-slate-400">
                            {answer.aiFeedback}
                          </p>
                        </div>
                      )}

                      {answer.improvedAnswer && (
                        <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-500/10 p-5">
                          <h4 className="mb-3 font-bold text-emerald-100">
                            Improved answer
                          </h4>

                          <p className="text-sm leading-6 text-emerald-100">
                            {answer.improvedAnswer}
                          </p>
                        </div>
                      )}

                      {answer.missingConcepts && (
                        <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 p-5">
                          <h4 className="mb-3 font-bold text-rose-100">
                            Missing concepts
                          </h4>

                          <p className="text-sm leading-6 text-rose-100">
                            {answer.missingConcepts}
                          </p>
                        </div>
                      )}

                      <Link
                        href={`/topics/${topic.slug}/${lesson.slug}/${part.id}`}
                        className="inline-flex rounded-2xl bg-violet-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
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
          <div className="mb-6">
            <h2 className="flex items-center gap-3 text-3xl font-black text-white">
              <span className="text-pink-500">⚠</span>
              Weak Areas
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Topics and lesson parts that need more practice.
            </p>
          </div>

          {weakAnswers.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-slate-300">No weak areas. Good job 🎉</p>
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
                    className="group block rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card-hover"
                  >
                    <p className="text-sm text-slate-400">
                      {topic.name} / {lesson.title}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <h3 className="text-xl font-black text-white">
                        {part.title}
                      </h3>

                      <p className="shrink-0 text-2xl font-black text-pink-500">
                        {answer.aiScore}/10
                      </p>
                    </div>

                    <p className="mt-4 text-sm font-bold text-violet-300">
                      Review lesson →
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
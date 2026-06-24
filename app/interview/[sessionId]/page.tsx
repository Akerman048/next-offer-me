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
  select: {
    id: true,
  },
});

const interview = await prisma.interviewSession.findFirst({
  where: {
    id: sessionId,
    userId: user.id,
  },
  select: {
    id: true,
    mode: true,
    answers: {
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        answerText: true,
        question: {
          select: {
            title: true,
            prompt: true,
            lessonPart: {
              select: {
                title: true,
                lesson: {
                  select: {
                    title: true,
                    topic: {
                      select: {
                        name: true,
                      },
                    },
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
      <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
        <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />

            <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-violet-400">
              Interview completed
            </p>

            <h1 className="mb-5 text-5xl font-black tracking-tight text-white">
              Interview completed 🎉
            </h1>

            <p className="mb-8 max-w-2xl text-sm leading-6 text-slate-300">
              You answered all questions. Open your result to review your score,
              feedback, and weak areas.
            </p>

            <form action={finishInterview}>
              <input type="hidden" name="sessionId" value={interview.id} />

              <button className="rounded-2xl bg-violet-500 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 hover:bg-violet-400">
                View result →
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
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl">
        <Link
          href="/interview"
          className="mb-6 inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          ← Exit interview
        </Link>

        <section className="mb-8 rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-400">
              Question {answeredCount + 1} / {interview.answers.length}
            </p>

            <p className="text-lg font-black text-white">{progress}%</p>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-card shadow-2xl backdrop-blur-xl">
          <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] px-8 py-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-violet-400/10" />

            <p className="mb-4 text-sm font-semibold text-slate-300">
              {topic.name} / {lesson.title} / {part.title}
            </p>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              {question.title}
            </h1>
          </div>

          <div className="prose prose-invert max-w-none bg-background/60 p-6 text-slate-200 md:p-8">
            <MarkdownContent content={question.prompt} />
          </div>
        </section>

        <div className="rounded-[32px] border border-white/10 bg-card p-2 shadow-2xl backdrop-blur-xl sm:p-3">
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
      </div>
    </main>
  );
}

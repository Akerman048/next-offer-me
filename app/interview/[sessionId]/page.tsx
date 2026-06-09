import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { submitInterviewAnswer, finishInterview } from "./actions";
import MarkdownContent from "@/components/ui/MarkdownContent";

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

  const currentAnswer =
    interview.answers.find((answer) => !answer.answerText) ?? null;

  const answeredCount = interview.answers.filter(
    (answer) => answer.answerText,
  ).length;

  const progress = Math.round((answeredCount / interview.answers.length) * 100);

  if (!currentAnswer) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="mb-4 text-4xl font-bold">Interview completed</h1>

        <form action={finishInterview}>
          <input type="hidden" name="sessionId" value={interview.id} />

          <button className="rounded-lg bg-black px-5 py-3 text-white">
            View result
          </button>
        </form>
      </main>
    );
  }

  const currentIndex = interview.answers.findIndex(
    (answer) => answer.id === currentAnswer.id,
  );

  const question = currentAnswer.question;
  const topic = question.lessonPart.lesson.topic;
  const lesson = question.lessonPart.lesson;
  const part = question.lessonPart;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href="/interview"
        className="mb-6 inline-block rounded-lg border px-4 py-2"
      >
        ← Exit interview
      </Link>

      <div className="mb-8 rounded-xl border p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold">
            Question {currentIndex + 1} / {interview.answers.length}
          </p>

          <p className="font-semibold">{progress}%</p>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-300">
          <div
            className="h-full bg-green-600"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <section className="mb-8 rounded-xl border p-6">
        <p className="mb-2 text-sm text-gray-500">
          {topic.name} / {lesson.title} / {part.title}
        </p>
        <h1 className="mb-6 text-3xl font-bold">{question.title}</h1>
        <MarkdownContent content={question.prompt} />{" "}
      </section>

      <form action={submitInterviewAnswer} className="rounded-xl border p-6">
        <input
          type="hidden"
          name="interviewAnswerId"
          value={currentAnswer.id}
        />

        <input type="hidden" name="sessionId" value={interview.id} />

        <label className="mb-2 block font-medium">Your answer</label>

        <textarea
          name="answerText"
          required
          rows={8}
          placeholder="Type your answer like in a real interview..."
          className="mb-4 w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          className="rounded-lg bg-black px-5 py-3 text-white"
        >
          Submit answer
        </button>
      </form>
    </main>
  );
}

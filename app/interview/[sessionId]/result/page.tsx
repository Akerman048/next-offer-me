import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { generateRoadmap } from "./actions";

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
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-4xl font-bold">Interview Result</h1>

      <p className="mb-8 text-xl text-gray-500">
        Average score: {averageScore}/10
      </p>

      <form action={generateRoadmap} className="mb-8">
  <input type="hidden" name="sessionId" value={interview.id} />

  <button
    type="submit"
    className="rounded-lg bg-green-700 px-5 py-3 text-white transition hover:bg-green-800"
  >
    Generate roadmap
  </button>
</form>

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
  className="rounded-xl border p-5 shadow-sm"
>
  <div className="mb-3 flex items-center justify-between gap-4">
    <div>
      <h3 className="font-semibold">{question.title}</h3>

      <p className="mt-1 text-sm text-gray-500">
        {topic.name} / {lesson.title} / {part.title}
      </p>
    </div>

    <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-sm text-white">
      {answer.aiScore ?? 0}/10
    </span>
  </div>

  <div className="grid gap-2 sm:grid-cols-4">
    <p className="rounded-lg bg-slate-800 p-2 text-sm text-white">
      Accuracy: {answer.technicalAccuracy ?? 0}/10
    </p>

    <p className="rounded-lg bg-slate-800 p-2 text-sm text-white">
      Clarity: {answer.clarity ?? 0}/10
    </p>

    <p className="rounded-lg bg-slate-800 p-2 text-sm text-white">
      Complete: {answer.completeness ?? 0}/10
    </p>

    <p className="rounded-lg bg-slate-800 p-2 text-sm text-white">
      Style: {answer.interviewStyle ?? 0}/10
    </p>
  </div>

  {answer.timeSpentSeconds !== null && (
    <p className="mt-3 text-sm text-gray-500">
      Time spent: {answer.timeSpentSeconds}s
    </p>
  )}

  <details className="mt-4 rounded-xl border p-4">
    <summary className="cursor-pointer font-medium">
      View detailed feedback
    </summary>

    <div className="mt-4 space-y-4">
      {answer.aiFeedback && (
        <div>
          <h4 className="mb-1 font-semibold">Feedback</h4>
          <p className="text-sm text-gray-600">{answer.aiFeedback}</p>
        </div>
      )}

      {answer.improvedAnswer && (
        <div className="rounded-lg bg-green-950 p-4">
          <h4 className="mb-2 font-semibold text-white">
            Improved answer
          </h4>
          <p className="text-sm text-white">{answer.improvedAnswer}</p>
        </div>
      )}

      {answer.missingConcepts && (
        <div className="rounded-lg bg-red-900 p-4">
          <h4 className="mb-2 font-semibold text-white">
            Missing concepts
          </h4>
          <p className="text-sm text-white">{answer.missingConcepts}</p>
        </div>
      )}

      <Link
        href={`/topics/${topic.slug}/${lesson.slug}/${part.id}`}
        className="inline-block rounded-lg bg-black px-4 py-2 text-sm text-white"
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
          <p className="text-gray-500">No weak areas. Good job 🎉</p>
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
                  className="block rounded-xl border p-5 transition hover:bg-slate-700"
                >
                  <p className="text-sm text-gray-500">
                    {topic.name} / {lesson.title}
                  </p>

                  <h3 className="text-lg font-semibold">{part.title}</h3>

                  <p className="text-sm text-red-500">
                    Score: {answer.aiScore}/10
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

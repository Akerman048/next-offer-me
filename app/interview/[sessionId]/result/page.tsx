import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

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
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

  const weakAnswers = interview.answers.filter(
    (answer) => answer.aiScore !== null && answer.aiScore < 7,
  );

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-4xl font-bold">Interview Result</h1>

      <p className="mb-8 text-xl text-gray-500">
        Average score: {averageScore}/10
      </p>

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
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{question.title}</h3>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-white">
                    {answer.aiScore ?? 0}/10
                  </span>
                </div>

                <p className="mb-2 text-sm text-gray-500">
                  {topic.name} / {lesson.title} / {part.title}
                </p>

                {answer.aiFeedback && (
                  <p className="mb-4 text-sm text-gray-600">
                    {answer.aiFeedback}
                  </p>
                )}

                <Link
                  href={`/topics/${topic.slug}/${lesson.slug}/${part.id}`}
                  className="inline-block rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                  Review lesson
                </Link>
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
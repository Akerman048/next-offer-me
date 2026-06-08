import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

import { markQuestionCompleted, submitAnswer } from "./actions";

type Props = {
  params: Promise<{
    slug: string;
    questionId: string;
  }>;
};

export default async function QuestionPage({ params }: Props) {
  const session = await auth();
  const { slug, questionId } = await params;

  if (!session?.user?.email) {
    redirect("/login");
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { topic: true },
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  if (!question || question.topic.slug !== slug) {
    notFound();
  }

  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_questionId: {
        userId: user.id,
        questionId: question.id,
      },
    },
  });

  const answers = await prisma.userAnswer.findMany({
    where: {
      userId: user.id,
      questionId: question.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const isCompleted = progress?.completed ?? false;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <p className="mb-2 text-sm text-gray-500">{question.topic.name}</p>

      <h1 className="mb-4 text-4xl font-bold">{question.title}</h1>

      <span className="mb-8 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-blue-950">
        {question.level}
      </span>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Short Answer</h2>
        <p>{question.answer}</p>
      </section>

      {question.explanation && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">Explanation</h2>
          <p>{question.explanation}</p>
        </section>
      )}

      <form action={submitAnswer}>
        <input type="hidden" name="questionId" value={question.id} />
        <input type="hidden" name="questionText" value={question.title} />
        <input
          type="hidden"
          name="path"
          value={`/topics/${question.topic.slug}/${question.id}`}
        />

        <textarea
          name="answerText"
          required
          rows={6}
          placeholder="Write your answer..."
          className="w-full rounded-xl border p-3"
        />

        <button
          type="submit"
          className="rounded-xl bg-black px-5 py-3 text-white transition hover:bg-neutral-800 hover:cursor-pointer"
        >
          Submit answer
        </button>
      </form>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Your answers</h2>

        {answers.length > 0 ? (
          answers.map((answer) => (
            <div key={answer.id} className="mb-4 rounded-xl border p-4">
              <p className="mb-2">{answer.answerText}</p>

              {answer.aiFeedback && (
                <p className="text-gray-600">{answer.aiFeedback}</p>
              )}

              {answer.aiScore !== null && (
                <p className="mt-2 font-medium">Score: {answer.aiScore}/10</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            You haven't submitted any answers yet.
          </p>
        )}
      </section>

      <form action={markQuestionCompleted} className="mt-8">
        <input type="hidden" name="questionId" value={question.id} />
        <input
          type="hidden"
          name="path"
          value={`/topics/${question.topic.slug}/${question.id}`}
        />

        <button
          type="submit"
          disabled={isCompleted}
          className="rounded-lg bg-black px-5 py-3 text-white transition hover:opacity-80 hover:bg-mist-800 hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-green-600"
        >
          {isCompleted ? "Completed ✅" : "Mark as completed"}
        </button>
      </form>
    </main>
  );
}

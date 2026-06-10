import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const topics = await prisma.topic.findMany({
    include: {
      lessons: {
        include: {
          parts: {
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
    },
    orderBy: {
      name: "asc",
    },
  });

  const weakAnswers = await prisma.userAnswer.findMany({
  where: {
    userId: user.id,
    aiScore: {
      lt: 8,
    },
  },
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
    createdAt: "desc",
  },
  take: 5,
});

  const getTopicParts = (topic: (typeof topics)[number]) => {
    return topic.lessons.flatMap((lesson) => lesson.parts);
  };

  const totalParts = topics.reduce((sum, topic) => {
    return sum + getTopicParts(topic).length;
  }, 0);

  const completedParts = topics.reduce((sum, topic) => {
    const parts = getTopicParts(topic);

    return sum + parts.filter((part) => part.progress.length > 0).length;
  }, 0);

  const startedTopics = topics.filter((topic) => {
    const parts = getTopicParts(topic);

    return parts.some((part) => part.progress.length > 0)
  })

  const latestRoadmap = await prisma.roadmap.findFirst({
  where: {
    userId: user.id,
  },
  orderBy: {
    createdAt: "desc",
  },
});

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>

      <p className="mb-8 text-gray-500">
        Progress: {completedParts} / {totalParts} completed
      </p>

      <div className="space-y-4">
        {startedTopics.map((topic) => {
          const parts = getTopicParts(topic);

          const completed = parts.filter(
            (part) => part.progress.length > 0,
          ).length;

          const total = parts.length;

          return (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="block rounded-xl border p-5 shadow-sm transition hover:bg-slate-600"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{topic.name}</h2>

                <span className="text-sm text-gray-500">
                  {completed} / {total}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-400">
                <div
                  className="h-full bg-slate-800"
                  style={{
                    width: total > 0 ? `${(completed / total) * 100}%` : "0%",
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-4">
  <h2 className="mb-4 text-2xl font-semibold">Weak Answers</h2>

  <div className="space-y-4">
    {weakAnswers.length === 0 ? (
      <p className="text-gray-500">No weak answers yet.</p>
    ) : (
      weakAnswers.map((answer) => {
        if (!answer.question) return null;

        const part = answer.question.lessonPart;
        const lesson = part.lesson;
        const topic = lesson.topic;

        return (
          <article
            key={answer.id}
            className="rounded-xl border p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {answer.question.title}
              </h3>

              <span className="rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                {answer.aiScore}/10
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
      })
    )}
  </div>
</section>

<section className="mt-8 rounded-xl border p-6 shadow-sm">
  <div className="mb-4 flex items-center justify-between gap-4">
    <div>
      <h2 className="text-2xl font-semibold">Your AI Roadmap</h2>
      <p className="text-sm text-gray-500">
        Personalized plan based on your weak interview answers.
      </p>
    </div>

    <Link
      href="/roadmaps"
      className="rounded-lg border px-4 py-2 text-sm"
    >
      View all
    </Link>
  </div>

  {!latestRoadmap ? (
    <div className="rounded-lg bg-slate-100 p-4">
      <p className="text-sm text-gray-600">
        You do not have a roadmap yet. Complete an interview and generate your first AI roadmap.
      </p>

      <Link
        href="/interview"
        className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm text-white"
      >
        Start interview
      </Link>
    </div>
  ) : (
    <Link
      href={`/roadmaps/${latestRoadmap.id}`}
      className="block rounded-lg bg-slate-100 p-4 transition hover:bg-slate-200"
    >
      <h3 className="mb-2 font-semibold">{latestRoadmap.title}</h3>

      <p className="line-clamp-3 text-sm text-gray-600">
        {latestRoadmap.content}
      </p>

      <p className="mt-3 text-xs text-gray-500">
        Created {latestRoadmap.createdAt.toLocaleDateString()}
      </p>
    </Link>
  )}
</section>
    </main>
  );
}
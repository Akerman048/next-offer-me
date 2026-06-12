import Link from "next/link";
import { prisma } from "@/lib/prisma";

const Topics = async () => {
  const topics = await prisma.topic.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-3xl border border-border bg-card p-8 shadow-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-muted">
            Interview practice
          </p>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">
                Interview Topics
              </h1>

              <p className="mt-4 max-w-2xl text-muted">
                Choose a topic and practice structured frontend interview
                questions with lessons, answers, and AI feedback.
              </p>
            </div>

            <Link
              href="/interview"
              className="rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02]"
            >
              Start mock interview
            </Link>
          </div>
        </section>

        {topics.length === 0 ? (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">No topics yet</h2>

            <p className="mt-2 text-sm text-muted">
              Add topics from the admin panel to start building your interview
              library.
            </p>
          </section>
        ) : (
          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">All topics</h2>

                <p className="mt-1 text-sm text-muted">
                  Select a topic to continue learning.
                </p>
              </div>

              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted">
                {topics.length} topics
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-lg transition hover:-translate-y-1 hover:bg-card-hover"
                >
                  <h3 className="text-xl font-semibold transition group-hover:text-gray-100">
                    {topic.name}
                  </h3>

                  <p className="mt-2 text-sm text-muted">
                    Practice interview questions and review learning materials.
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-200">
                      Start learning
                    </span>

                    <span className="rounded-full bg-secondary px-3 py-1 text-sm transition group-hover:bg-primary group-hover:text-primary-foreground">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Topics;
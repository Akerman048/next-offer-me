import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTopic, deleteTopic } from "./actions";

export default async function AdminTopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          lessons: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-4xl font-bold">Admin Topics</h1>

      <form
        action={createTopic}
        className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Topic name
          </label>

          <input
            name="name"
            required
            placeholder="React"
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition placeholder:text-muted focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02]"
        >
          Create Topic
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Existing Topics</h2>

        <div className="space-y-4">
          {topics.map((topic) => (
            <article
              key={topic.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{topic.name}</h3>

                  <p className="text-sm text-muted">/{topic.slug}</p>

                  <p className="text-sm text-muted">
                    Lessons: {topic._count.lessons}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/topics/${topic.id}/edit`}
                    className="rounded-xl bg-secondary px-4 py-2 text-sm transition hover:bg-card-hover"
                  >
                    Edit
                  </Link>

                  <form action={deleteTopic}>
                    <input type="hidden" name="id" value={topic.id} />

                    <button
                      type="submit"
                      className="rounded-xl bg-danger px-4 py-2 text-sm font-medium text-gray-100 transition hover:scale-[1.02]"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
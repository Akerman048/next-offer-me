import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createLesson, deleteLesson } from "./actions";

type Props = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

const PAGE_SIZE = 20;

export default async function AdminLessonsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;

  const currentPage = Math.max(Number(resolvedSearchParams?.page || 1), 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [topics, lessons, totalLessons] = await Promise.all([
    prisma.topic.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        order: true,
        topic: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            parts: true,
          },
        },
      },
      orderBy: [
        {
          topic: {
            name: "asc",
          },
        },
        {
          order: "asc",
        },
      ],
      take: PAGE_SIZE,
      skip,
    }),

    prisma.lesson.count(),
  ]);

  const totalPages = Math.max(Math.ceil(totalLessons / PAGE_SIZE), 1);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-4xl font-bold">Admin Lessons</h1>

      <form
        action={createLesson}
        className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Topic
          </label>

          <select
            name="topicId"
            required
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition focus:border-primary"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Lesson title
          </label>

          <input
            name="title"
            required
            placeholder="Variables"
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Description
          </label>

          <textarea
            name="description"
            rows={8}
            placeholder="Markdown description..."
            className="w-full rounded-xl border border-border bg-background p-3 font-mono text-foreground outline-none transition placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-medium text-gray-200">
            Order
          </label>

          <input
            name="order"
            type="number"
            defaultValue={0}
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02]"
        >
          Create Lesson
        </button>
      </form>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Existing Lessons</h2>

          <span className="text-sm text-muted">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="space-y-4">
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{lesson.title}</h3>

                  <p className="text-sm text-muted">
                    {lesson.topic.name} / {lesson.slug}
                  </p>

                  <p className="text-sm text-muted">
                    Parts: {lesson._count.parts}
                  </p>

                  <p className="text-sm text-muted">Order: {lesson.order}</p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/lessons/${lesson.id}/edit`}
                    className="rounded-xl bg-secondary px-4 py-2 text-sm transition hover:bg-card-hover"
                  >
                    Edit
                  </Link>

                  <form action={deleteLesson}>
                    <input type="hidden" name="id" value={lesson.id} />

                    <button
                      type="submit"
                      className="rounded-xl bg-danger px-4 py-2 text-sm font-medium text-gray-100 transition hover:scale-[1.02]"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              {lesson.description && (
                <p className="mt-4 line-clamp-3 rounded-xl border border-border bg-background p-4 text-sm text-muted">
                  {lesson.description}
                </p>
              )}
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <Link
            href={`/admin/lessons?page=${Math.max(currentPage - 1, 1)}`}
            aria-disabled={currentPage === 1}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              currentPage === 1
                ? "pointer-events-none bg-secondary text-muted opacity-50"
                : "bg-secondary hover:bg-card-hover",
            ].join(" ")}
          >
            ← Previous
          </Link>

          <Link
            href={`/admin/lessons?page=${Math.min(
              currentPage + 1,
              totalPages,
            )}`}
            aria-disabled={currentPage === totalPages}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              currentPage === totalPages
                ? "pointer-events-none bg-secondary text-muted opacity-50"
                : "bg-secondary hover:bg-card-hover",
            ].join(" ")}
          >
            Next →
          </Link>
        </div>
      </section>
    </main>
  );
}
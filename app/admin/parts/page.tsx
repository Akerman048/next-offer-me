import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createLessonPart, deleteLessonPart } from "./actions";
import MarkdownContent from "@/components/ui/MarkdownContent";

export default async function AdminPartsPage() {
  const lessons = await prisma.lesson.findMany({
    include: {
      topic: true,
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
  });

  const parts = await prisma.lessonPart.findMany({
    include: {
      lesson: {
        include: {
          topic: true,
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: [
      {
        lesson: {
          topic: {
            name: "asc",
          },
        },
      },
      {
        lesson: {
          order: "asc",
        },
      },
      {
        order: "asc",
      },
    ],
  });

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-4xl font-bold">Admin Parts</h1>

      <form
        action={createLessonPart}
        className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Lesson
          </label>

          <select
            name="lessonId"
            required
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition focus:border-primary"
          >
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.topic.name} / {lesson.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Part title
          </label>

          <input
            name="title"
            required
            placeholder="What are Variables?"
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Content
          </label>

          <textarea
            name="content"
            required
            rows={10}
            placeholder="Markdown content..."
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
          Create Part
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Existing Parts</h2>

        <div className="space-y-4">
          {parts.map((part) => (
            <article
              key={part.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{part.title}</h3>

                  <p className="text-sm text-muted">
                    {part.lesson.topic.name} / {part.lesson.title}
                  </p>

                  <p className="text-sm text-muted">
                    Questions: {part._count.questions}
                  </p>

                  <p className="text-sm text-muted">
                    Order: {part.order}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/parts/${part.id}/edit`}
                    className="rounded-xl bg-secondary px-4 py-2 text-sm transition hover:bg-card-hover"
                  >
                    Edit
                  </Link>

                  <form action={deleteLessonPart}>
                    <input type="hidden" name="id" value={part.id} />

                    <button
                      type="submit"
                      className="rounded-xl bg-danger px-4 py-2 text-sm font-medium text-gray-100 transition hover:scale-[1.02]"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm">
                <MarkdownContent content={part.content} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
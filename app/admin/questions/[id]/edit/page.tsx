import { prisma } from "@/lib/prisma";
import { Level } from "@/generated/prisma/enums";
import { updateQuestion } from "../../actions";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditQuestionPage({ params }: Props) {
  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: {
      id,
    },
    include: {
      lessonPart: true,
    },
  });

  const parts = await prisma.lessonPart.findMany({
    include: {
      lesson: {
        include: {
          topic: true,
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

  if (!question) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-8 text-4xl font-bold">Edit Question</h1>

      <form
        action={updateQuestion}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <input type="hidden" name="id" value={question.id} />

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Lesson Part
          </label>

          <select
            name="lessonPartId"
            required
            defaultValue={question.lessonPartId}
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition focus:border-primary"
          >
            {parts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.lesson.topic.name} / {part.lesson.title} / {part.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Question title
          </label>

          <input
            name="title"
            required
            defaultValue={question.title}
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Prompt
          </label>

          <textarea
            name="prompt"
            required
            rows={6}
            defaultValue={question.prompt}
            className="w-full rounded-xl border border-border bg-background p-3 font-mono text-foreground outline-none transition placeholder:text-muted focus:border-primary"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-gray-200">
            Order
          </label>

          <input
            name="order"
            type="number"
            defaultValue={question.order}
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-medium text-gray-200">
            Level
          </label>

          <select
            name="level"
            required
            defaultValue={question.level}
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition focus:border-primary"
          >
            <option value={Level.JUNIOR}>Junior</option>
            <option value={Level.MIDDLE}>Middle</option>
            <option value={Level.SENIOR}>Senior</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02]"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
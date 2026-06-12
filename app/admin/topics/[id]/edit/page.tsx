import { prisma } from "@/lib/prisma";
import { updateTopic } from "../../actions";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTopicPage({ params }: Props) {
  const { id } = await params;

  const topic = await prisma.topic.findUnique({
    where: {
      id,
    },
  });

  if (!topic) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-8 text-4xl font-bold">
        Edit Topic
      </h1>

      <form
        action={updateTopic}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <input type="hidden" name="id" value={topic.id} />

        <div className="mb-6">
          <label className="mb-2 block font-medium text-gray-200">
            Topic name
          </label>

          <input
            name="name"
            required
            defaultValue={topic.name}
            className="w-full rounded-xl border border-border bg-background p-3 text-foreground outline-none transition placeholder:text-muted focus:border-primary"
          />
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
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      questions: true,
    },
  });

  if (!topic) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
<BackButton/>
      <h1 className="mb-4 mt-4 text-4xl font-bold">{topic.name}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topic.questions.map((question) => (
          <Link
            key={question.id}
            href={`/topics/${topic.slug}/${question.id}`}
            className="group rounded-2xl border border-slate-200 bg-mist-300 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold transition group-hover:text-slate-700">
              {question.title}
            </h2>
            <p className="mt-auto text-sm text-gray-500">{question.level}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

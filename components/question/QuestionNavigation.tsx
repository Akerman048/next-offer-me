import Link from "next/link";

type Props = {
  slug: string;
  lessonSlug: string;
  prevQuestionId?: string;
  nextQuestionId?: string;
};

export default function QuestionNavigation({
  slug,
  lessonSlug,
  prevQuestionId,
  nextQuestionId,
}: Props) {
  return (
    <div className="mb-8 flex justify-between">
      {prevQuestionId ? (
        <Link
          href={`/topics/${slug}/${lessonSlug}/${prevQuestionId}`}
          className="rounded-lg border px-4 py-2"
        >
          ← Previous
        </Link>
      ) : (
        <Link
          href={`/topics/${slug}/${lessonSlug}`}
          className="rounded-lg border px-4 py-2"
        >
          ← Lesson
        </Link>
      )}

      {nextQuestionId && (
        <Link
          href={`/topics/${slug}/${lessonSlug}/${nextQuestionId}`}
          className="rounded-lg border px-4 py-2"
        >
          Next →
        </Link>
      )}
    </div>
  );
}
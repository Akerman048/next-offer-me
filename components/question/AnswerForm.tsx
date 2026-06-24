import { submitAnswer } from "@/app/topics/[slug]/[lessonSlug]/[partId]/actions";

type Props = {
  questionId: string;
  questionText: string;
  path: string;
};

export default function AnswerForm({ questionId, questionText, path }: Props) {
  return (
    <form action={submitAnswer} className="space-y-4">
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="questionText" value={questionText} />
      <input type="hidden" name="path" value={path} />

      <textarea
        name="answerText"
        required
        rows={6}
        placeholder="Write your answer..."
        className="w-full min-w-0 rounded-xl border p-3"
      />

      <button
        type="submit"
        className="w-full rounded-xl bg-black px-5 py-3 text-white transition hover:cursor-pointer hover:bg-neutral-800 sm:w-auto"
      >
        Submit answer
      </button>
    </form>
  );
}

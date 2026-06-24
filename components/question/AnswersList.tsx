import { evaluateAnswer } from "@/app/topics/[slug]/[lessonSlug]/[partId]/actions";
import EvaluateAnswerButton from "@/components/question/EvaluateAnswerButton";

type AnswerItem = {
  id: string;
  questionId: string | null;
  answerText: string;
  aiFeedback: string | null;
  aiScore: number | null;
  aiRoadmap: string | null;
  createdAt: Date;
};

type Props = {
  answers: AnswerItem[];
  path: string;
};

export default function AnswersList({ answers, path }: Props) {
  return (
    <section className="mt-10 min-w-0">
      <h2 className="mb-4 break-words text-xl font-semibold">Your answers</h2>

      {answers.length > 0 ? (
        answers.map((answer) => (
          <div key={answer.id} className="mb-4 min-w-0 rounded-xl border p-4">
            <p className="mb-2 break-words [overflow-wrap:anywhere]">
              {answer.answerText}
            </p>

            {!answer.aiFeedback ? (
              <form action={evaluateAnswer} className="mt-4">
                <input type="hidden" name="answerId" value={answer.id} />
                <input type="hidden" name="path" value={path} />

                <EvaluateAnswerButton />
              </form>
            ) : (
              <>
                <p className="break-words text-gray-600 [overflow-wrap:anywhere]">
                  {answer.aiFeedback}
                </p>

                {answer.aiScore !== null && (
                  <p className="mt-2 font-medium">Score: {answer.aiScore}/10</p>
                )}

                {answer.aiRoadmap && (
                  <pre className="mt-3 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-gray-800 p-3 text-sm [overflow-wrap:anywhere]">
                    {answer.aiRoadmap}
                  </pre>
                )}
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">
          You haven&apos;t submitted any answers yet.
        </p>
      )}
    </section>
  );
}

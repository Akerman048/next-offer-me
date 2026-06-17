"use client";

import { useEffect, useState } from "react";
import { submitInterviewAnswer } from "@/app/interview/[sessionId]/actions";
import SubmitAnswerButton from "./SubmitAnswerButton";

type Props = {
  interviewAnswerId: string;
  sessionId: string;
  secondsLimit: number;
};

export default function InterviewAnswerForm({
  interviewAnswerId,
  sessionId,
  secondsLimit,
}: Props) {
  const [secondsSpent, setSecondsSpent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeLeft =
    secondsLimit > 0 ? Math.max(secondsLimit - secondsSpent, 0) : null;

  return (
    <form action={submitInterviewAnswer} className="rounded-xl border p-6">
      <input type="hidden" name="interviewAnswerId" value={interviewAnswerId} />
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="timeSpentSeconds" value={secondsSpent} />

      {secondsLimit > 0 && (
        <div className="mb-4 rounded-lg bg-slate-100 p-3">
          <p className="font-medium">Time left: {timeLeft}s</p>

          {timeLeft === 0 && (
            <p className="mt-1 text-sm text-red-600">
              Time is over, but you can still submit your answer.
            </p>
          )}
        </div>
      )}

      <label className="mb-2 block font-medium">Your answer</label>

      <textarea
        name="answerText"
        required
        rows={8}
        placeholder="Type your answer like in a real interview..."
        className="mb-4 w-full rounded-lg border p-3"
      />

      <SubmitAnswerButton />
    </form>
  );
}
"use client";

import { useEffect, useState } from "react";
import { submitInterviewAnswer } from "@/app/interview/[sessionId]/actions";
import VoiceTextarea from "@/components/ui/VoiceTextarea";
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
    <form
      action={submitInterviewAnswer}
      className="p-3 sm:p-4"
    >
      <input type="hidden" name="interviewAnswerId" value={interviewAnswerId} />
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="timeSpentSeconds" value={secondsSpent} />

      {secondsLimit > 0 && (
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-bold text-slate-100">
            Time left: <span className="text-violet-300">{timeLeft}s</span>
          </p>

          {timeLeft === 0 && (
            <p className="mt-2 text-sm text-rose-300">
              Time is over, but you can still submit your answer.
            </p>
          )}
        </div>
      )}

      <label className="mb-2 block font-semibold text-slate-100">
        Your answer
      </label>

      <VoiceTextarea
        name="answerText"
        required
        rows={8}
        placeholder="Type your answer like in a real interview..."
        className="mb-4 w-full rounded-xl border border-white/15 bg-background p-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400"
      />

      <div className="mt-4">
        <SubmitAnswerButton />
      </div>
    </form>
  );
}

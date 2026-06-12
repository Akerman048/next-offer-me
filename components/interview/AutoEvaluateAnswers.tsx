"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  sessionId: string;
  hasPendingAnswers: boolean;
};

export default function AutoEvaluateAnswers({
  sessionId,
  hasPendingAnswers,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!hasPendingAnswers) return;

    const interval = setInterval(async () => {
      await fetch(`/api/interview/${sessionId}/evaluate`, {
        method: "POST",
      });

      startTransition(() => {
        router.refresh();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, hasPendingAnswers, router]);

  return null;
}
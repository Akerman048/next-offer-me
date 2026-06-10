"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitInterviewAnswer(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const interviewAnswerId = formData.get("interviewAnswerId") as string;
  const answerText = formData.get("answerText") as string;
  const sessionId = formData.get("sessionId") as string;
  const timeSpentSeconds = Number(formData.get("timeSpentSeconds") || 0);

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const interviewAnswer = await prisma.interviewAnswer.findFirstOrThrow({
    where: {
      id: interviewAnswerId,
      session: {
        userId: user.id,
      },
    },
    include: {
      question: true,
    },
  });

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a strict but helpful technical interviewer. Return raw JSON only. Do not use markdown. Do not wrap the response in ```json or ```.",
      },
      {
        role: "user",
content: `
Question:
${interviewAnswer.question.prompt}

User answer:
${answerText}

Time spent: ${timeSpentSeconds} seconds

Return only JSON:
{
  "score": number,
  "technicalAccuracy": number,
  "clarity": number,
  "completeness": number,
  "interviewStyle": number,
  "feedback": string,
  "improvedAnswer": string,
  "missingConcepts": string[]
}
`,
      },
    ],
  });

const raw = aiResponse.choices[0]?.message?.content ?? "{}";

const cleaned = raw
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const result = JSON.parse(cleaned) as {
  score: number;
  technicalAccuracy: number;
  clarity: number;
  completeness: number;
  interviewStyle: number;
  feedback: string;
  improvedAnswer: string;
  missingConcepts: string[];
};

await prisma.interviewAnswer.update({
  where: {
    id: interviewAnswer.id,
  },
  data: {
    answerText,
    aiScore: result.score,
    aiFeedback: result.feedback,
    technicalAccuracy: result.technicalAccuracy,
    clarity: result.clarity,
    completeness: result.completeness,
    interviewStyle: result.interviewStyle,
    improvedAnswer: result.improvedAnswer,
    missingConcepts: result.missingConcepts.join(", "),
    timeSpentSeconds,
  },
});

  revalidatePath(`/interview/${sessionId}`);
}
export async function finishInterview(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const sessionId = formData.get("sessionId") as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const interview = await prisma.interviewSession.findFirstOrThrow({
  where: {
    id: sessionId,
    userId: user.id,
  },
});

await prisma.interviewSession.update({
  where: {
    id: interview.id,
  },
  data: {
    status: "COMPLETED",
  },
});

  redirect(`/interview/${sessionId}/result`);
}



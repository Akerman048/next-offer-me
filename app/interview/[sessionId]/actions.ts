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
          "You are a strict but helpful technical interviewer. Return only valid JSON.",
      },
      {
        role: "user",
        content: `
Question:
${interviewAnswer.question.prompt}

User answer:
${answerText}

Return only JSON:
{
  "score": number,
  "feedback": string
}
`,
      },
    ],
  });

  const raw = aiResponse.choices[0]?.message?.content ?? "{}";

  const result = JSON.parse(raw) as {
    score: number;
    feedback: string;
  };

  await prisma.interviewAnswer.update({
    where: {
      id: interviewAnswer.id,
    },
    data: {
      answerText,
      aiScore: result.score,
      aiFeedback: result.feedback,
    },
  });

  revalidatePath(`/interview/${sessionId}`);
}

export async function finishInterview(formData: FormData) {
  const sessionId = formData.get("sessionId") as string;

  await prisma.interviewSession.update({
    where: {
      id: sessionId,
    },
    data: {
      status: "COMPLETED",
    },
  });

  redirect(`/interview/${sessionId}/result`);
}
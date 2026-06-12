"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { openai } from "@/lib/openai";

export const submitAnswer = async (formData: FormData) => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const questionId = formData.get("questionId") as string;
  const questionText = formData.get("questionText") as string;
  const answerText = formData.get("answerText") as string;
  const path = formData.get("path") as string;

  await prisma.userAnswer.create({
    data: {
      userId: user.id,
      questionId,
      questionText,
      answerText,
    },
  });

  revalidatePath(path);
};

export const evaluateAnswer = async (formData: FormData) => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const answerId = formData.get("answerId") as string;
  const path = formData.get("path") as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const answer = await prisma.userAnswer.findFirstOrThrow({
    where: {
      id: answerId,
      userId: user.id,
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
${answer.questionText}

User answer:
${answer.answerText}

Return only JSON:

{
  "score": number,
  "feedback": string,
  "improvedAnswer": string,
  "weakPoints": string[],
  "studyPlan": string[]
}
`,
      },
    ],
  });

  const feedback = aiResponse.choices[0]?.message?.content ?? "{}";

  const result = JSON.parse(feedback) as {
    score: number;
    feedback: string;
    improvedAnswer: string;
    weakPoints: string[];
    studyPlan: string[];
  };

  await prisma.userAnswer.update({
    where: {
      id: answer.id,
    },
    data: {
      aiScore: result.score,
      aiFeedback: result.feedback,
      aiRoadmap: [
        `Improved answer: ${result.improvedAnswer}`,
        `Weak points: ${result.weakPoints.join(", ")}`,
        `Study plan: ${result.studyPlan.join(", ")}`,
      ].join("\n\n"),
    },
  });

  revalidatePath(path);
};

export async function completePartAndRedirect(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const partId = formData.get("partId") as string;
  const nextPath = formData.get("nextPath") as string;
  const currentPath = formData.get("currentPath") as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  await prisma.userProgress.upsert({
    where: {
      userId_lessonPartId: {
        userId: user.id,
        lessonPartId: partId,
      },
    },
    update: {
      completed: true,
    },
    create: {
      userId: user.id,
      lessonPartId: partId,
      completed: true,
    },
  });

  revalidatePath(currentPath);
  revalidatePath(nextPath);

  redirect(nextPath);
}
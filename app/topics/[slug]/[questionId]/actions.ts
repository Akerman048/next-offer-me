"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function markQuestionCompleted(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }
  const questionId = formData.get("questionId") as string;
  const path = formData.get("path") as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  await prisma.userProgress.upsert({
    where: {
      userId_questionId: {
        userId: user.id,
        questionId,
      },
    },
    update: {
      completed: true,
    },
    create: {
      userId: user.id,
      questionId,
      completed: true,
    },
  });

  revalidatePath(path);
}

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

  await prisma.userProgress.upsert({
    where: {
      userId_questionId: {
        userId: user.id,
        questionId,
      },
    },
    update: {
      completed: true,
    },
    create: {
      userId: user.id,
      questionId,
      completed: true,
    },
  });

  revalidatePath(path);
};

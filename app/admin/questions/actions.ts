"use server";

import { prisma } from "@/lib/prisma";
import { Level } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createQuestion(formData: FormData) {
  const lessonPartId = formData.get("lessonPartId") as string;
  const title = formData.get("title") as string;
  const prompt = formData.get("prompt") as string;
  const level = formData.get("level") as Level;
  const order = Number(formData.get("order") || 0);

  await prisma.question.create({
    data: {
      lessonPartId,
      title,
      prompt,
      level,
      order,
    },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/questions");
}

export async function deleteQuestion(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.question.delete({
    where: { id },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/questions");
}

export async function updateQuestion(formData: FormData) {
  const id = formData.get("id") as string;
  const lessonPartId = formData.get("lessonPartId") as string;
  const title = formData.get("title") as string;
  const prompt = formData.get("prompt") as string;
  const level = formData.get("level") as Level;
  const order = Number(formData.get("order") || 0);

  await prisma.question.update({
    where: { id },
    data: {
      lessonPartId,
      title,
      prompt,
      level,
      order,
    },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/questions");

  redirect("/admin/questions");
}
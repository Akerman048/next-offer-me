"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createLessonPart(formData: FormData) {
  const lessonId = formData.get("lessonId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const order = Number(formData.get("order") || 0);

  await prisma.lessonPart.create({
    data: {
      lessonId,
      title,
      content,
      order,
    },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/parts");
  revalidatePath("/admin/questions");
}

export async function deleteLessonPart(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.lessonPart.delete({
    where: {
      id,
    },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/parts");
  revalidatePath("/admin/questions");
}

export async function updateLessonPart(formData: FormData) {
  const id = formData.get("id") as string;
  const lessonId = formData.get("lessonId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const order = Number(formData.get("order") || 0);

  await prisma.lessonPart.update({
    where: {
      id,
    },
    data: {
      lessonId,
      title,
      content,
      order,
    },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/parts");
  revalidatePath("/admin/questions");

  redirect("/admin/parts");
}
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[#]/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createLesson(formData: FormData) {
  const topicId = formData.get("topicId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const order = Number(formData.get("order") || 0);

  await prisma.lesson.create({
    data: {
      topicId,
      title,
      slug: createSlug(title),
      description,
      order,
    },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/lessons");
}

export async function deleteLesson(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.lesson.delete({
    where: { id },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/lessons");
}

export async function updateLesson(formData: FormData) {
  const id = formData.get("id") as string;
  const topicId = formData.get("topicId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const order = Number(formData.get("order") || 0);

  await prisma.lesson.update({
    where: { id },
    data: {
      topicId,
      title,
      slug: createSlug(title),
      description,
      order,
    },
  });

  revalidatePath("/topics");
  revalidatePath("/admin/lessons");

  redirect("/admin/lessons");
}
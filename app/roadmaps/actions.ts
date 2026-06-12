"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteRoadmap(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const roadmapId = formData.get("roadmapId") as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  await prisma.roadmap.delete({
    where: {
      id: roadmapId,
      userId: user.id,
    },
  });

  revalidatePath("/roadmaps");
}
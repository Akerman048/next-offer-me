"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleRoadmapItem(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const itemId = formData.get("itemId") as string;
  const roadmapId = formData.get("roadmapId") as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const item = await prisma.roadmapItem.findFirstOrThrow({
    where: {
      id: itemId,
      week: {
        roadmap: {
          userId: user.id,
        },
      },
    },
  });

  await prisma.roadmapItem.update({
    where: {
      id: item.id,
    },
    data: {
      completed: !item.completed,
    },
  });

  revalidatePath(`/roadmaps/${roadmapId}`);
}
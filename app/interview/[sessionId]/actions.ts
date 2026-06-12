"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
  });

await prisma.interviewAnswer.update({
  where: {
    id: interviewAnswer.id,
  },
  data: {
    answerText,
    timeSpentSeconds,
    evaluationStatus: "PENDING",
  },
});

revalidatePath(`/interview/${sessionId}`);
redirect(`/interview/${sessionId}`);
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



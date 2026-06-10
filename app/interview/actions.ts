"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Level, InterviewMode } from "@/generated/prisma/enums";
import { redirect } from "next/navigation";

function shuffle<T>(array: T[]) {
  return array.sort(() => Math.random() - 0.5);
}

export async function startInterview(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const mode = formData.get("mode") as InterviewMode | null;
  const selectedMode = mode ?? InterviewMode.PRACTICE;

  const secondsPerQuestion =
    selectedMode === InterviewMode.HARD
      ? 60
      : selectedMode === InterviewMode.REAL
        ? 90
        : 0;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const selectedTopics = formData.getAll("topics") as string[];
  const level = formData.get("level") as Level | "";
  const questionCount = Math.min(
    Number(formData.get("questionCount") || 5),
    20,
  );

  const durationSeconds =
    secondsPerQuestion > 0 ? questionCount * secondsPerQuestion : 0;

  const questions = await prisma.question.findMany({
    where: {
      level: level || undefined,

      lessonPart:
        selectedTopics.length > 0
          ? {
              lesson: {
                topic: {
                  slug: {
                    in: selectedTopics,
                  },
                },
              },
            }
          : undefined,
    },
    include: {
      lessonPart: {
        include: {
          lesson: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
  });

  const selectedQuestions = shuffle(questions).slice(0, questionCount);

  const interviewSession = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      level: level || null,
      questionCount: selectedQuestions.length,
      durationSeconds,
      mode: selectedMode,
      answers: {
        create: selectedQuestions.map((question) => ({
          questionId: question.id,
        })),
      },
    },
  });

  redirect(`/interview/${interviewSession.id}`);
}
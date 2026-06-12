import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { evaluateInterviewAnswer } from "@/lib/interview/evaluate-answer";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function POST(_request: Request, { params }: Props) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

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
    include: {
      answers: {
        where: {
          evaluationStatus: {
            in: ["PENDING", "FAILED"],
          },
          answerText: {
            not: null,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
    },
  });

  if (interview.answers.length === 0) {
    return NextResponse.json({
      picked: 0,
      completed: 0,
      failed: 0,
    });
  }

  const result = await evaluateInterviewAnswer(interview.answers[0].id);

  return NextResponse.json({
    picked: 1,
    result,
  });
}
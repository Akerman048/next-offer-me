import { prisma } from "@/lib/prisma";
import { evaluateInterviewAnswer } from "@/lib/interview/evaluate-answer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const answers = await prisma.interviewAnswer.findMany({
    where: {
      evaluationStatus: "PENDING",
      answerText: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 5,
  });

  let completed = 0;
  let failed = 0;
  let skipped = 0;

  for (const answer of answers) {
    const result = await evaluateInterviewAnswer(answer.id);

    if (result === "COMPLETED") completed++;
    if (result === "FAILED") failed++;
    if (result === "SKIPPED") skipped++;
  }

  return NextResponse.json({
    picked: answers.length,
    completed,
    failed,
    skipped,
  });
}
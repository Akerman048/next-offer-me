import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

type AiEvaluationResult = {
  score: number;
  technicalAccuracy: number;
  clarity: number;
  completeness: number;
  interviewStyle: number;
  feedback: string;
  improvedAnswer: string;
  missingConcepts: string[];
};

function parseAiJson(content: string): AiEvaluationResult {
  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned) as AiEvaluationResult;
}

export async function evaluateInterviewAnswer(answerId: string) {
  const answer = await prisma.interviewAnswer.findUniqueOrThrow({
    where: {
      id: answerId,
    },
    include: {
      question: true,
    },
  });

  if (!answer.answerText) return "SKIPPED";
  if (answer.evaluationStatus === "COMPLETED") return "SKIPPED";

  await prisma.interviewAnswer.update({
    where: {
      id: answer.id,
    },
    data: {
      evaluationStatus: "PROCESSING",
    },
  });

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a strict but helpful technical interviewer. Return raw JSON only. Do not use markdown. Do not wrap the response in ```json or ```.",
        },
        {
          role: "user",
          content: `
Question:
${answer.question.prompt}

User answer:
${answer.answerText}

Time spent: ${answer.timeSpentSeconds ?? 0} seconds

Return only JSON:
{
  "score": number,
  "technicalAccuracy": number,
  "clarity": number,
  "completeness": number,
  "interviewStyle": number,
  "feedback": string,
  "improvedAnswer": string,
  "missingConcepts": string[]
}
`,
        },
      ],
    });

    const raw = aiResponse.choices[0]?.message?.content ?? "{}";
    const result = parseAiJson(raw);

    await prisma.interviewAnswer.update({
      where: {
        id: answer.id,
      },
      data: {
        aiScore: result.score,
        aiFeedback: result.feedback,
        technicalAccuracy: result.technicalAccuracy,
        clarity: result.clarity,
        completeness: result.completeness,
        interviewStyle: result.interviewStyle,
        improvedAnswer: result.improvedAnswer,
        missingConcepts: result.missingConcepts.join(", "),
        evaluationStatus: "COMPLETED",
      },
    });

    return "COMPLETED";
  } catch (error) {
    console.error("Failed to evaluate answer:", error);

    await prisma.interviewAnswer.update({
      where: {
        id: answer.id,
      },
      data: {
        evaluationStatus: "FAILED",
      },
    });

    return "FAILED";
  }
}
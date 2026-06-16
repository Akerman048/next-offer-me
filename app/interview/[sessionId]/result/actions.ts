"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { redirect } from "next/navigation";

type RoadmapAIResult = {
  title: string;
  summary: string;
  weeks: {
    weekNumber: number;
    title: string;
    goal: string;
    description: string;
    topics: string[];
    practice: string[];
    project: string[];
    interview: string[];
  }[];
};

function parseRoadmapResponse(raw: string): RoadmapAIResult {
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const fallback: RoadmapAIResult = {
    title: "Interview improvement roadmap",
    summary: "A focused 4-week roadmap based on your weak interview answers.",
    weeks: [
      {
        weekNumber: 1,
        title: "Foundation",
        goal: "Review weak fundamentals",
        description: "Focus on the concepts that caused the lowest scores.",
        topics: ["Review missing concepts"],
        practice: ["Explain each weak answer again"],
        project: ["Build a small practice example"],
        interview: ["Practice concise technical explanations"],
      },
      {
        weekNumber: 2,
        title: "Practice",
        goal: "Improve problem explanation",
        description: "Practice answering similar questions with structure.",
        topics: ["Review related lessons"],
        practice: ["Write improved answers"],
        project: ["Add examples to your notes"],
        interview: ["Practice STAR-style technical answers"],
      },
      {
        weekNumber: 3,
        title: "Application",
        goal: "Apply concepts in code",
        description: "Use weak topics in small coding tasks.",
        topics: ["Deepen weak topics"],
        practice: ["Solve focused exercises"],
        project: ["Create a mini feature"],
        interview: ["Explain tradeoffs clearly"],
      },
      {
        weekNumber: 4,
        title: "Mock interview",
        goal: "Prepare for real interview conditions",
        description: "Repeat questions under time pressure.",
        topics: ["Review all weak areas"],
        practice: ["Do timed answers"],
        project: ["Polish final examples"],
        interview: ["Run a full mock interview"],
      },
    ],
  };

  try {
    const parsed = JSON.parse(cleaned) as RoadmapAIResult;

    if (!Array.isArray(parsed.weeks) || parsed.weeks.length === 0) {
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
}

export async function generateRoadmap(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const sessionId = formData.get("sessionId") as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  const interview = await prisma.interviewSession.findFirstOrThrow({
    where: {
      id: sessionId,
      userId: user.id,
    },
    select: {
      id: true,
      answers: {
        where: {
          aiScore: {
            lt: 8,
          },
        },
        select: {
          aiScore: true,
          aiFeedback: true,
          missingConcepts: true,
          question: {
            select: {
              prompt: true,
              lessonPart: {
                select: {
                  title: true,
                  lesson: {
                    select: {
                      title: true,
                      topic: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (interview.answers.length === 0) {
    redirect(`/interview/${sessionId}/result`);
  }

  const weakAnswersText = interview.answers
    .map((answer) => {
      const question = answer.question;
      const part = question.lessonPart;
      const lesson = part.lesson;
      const topic = lesson.topic;

      return `
Topic: ${topic.name}
Lesson: ${lesson.title}
Part: ${part.title}
Question: ${question.prompt}
Score: ${answer.aiScore}/10
Feedback: ${answer.aiFeedback ?? ""}
Missing concepts: ${answer.missingConcepts ?? ""}
`;
    })
    .join("\n---\n");

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert programming mentor. Return raw JSON only. Do not use markdown.",
      },
      {
        role: "user",
        content: `
Create a 4-week learning roadmap based on these weak answers.

Weak answers:
${weakAnswersText}

Return only JSON in this format:

{
  "title": "Interview improvement roadmap",
  "summary": "Short roadmap explanation",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Foundation",
      "goal": "Short goal",
      "description": "Short description",
      "topics": ["topic 1", "topic 2"],
      "practice": ["task 1", "task 2"],
      "project": ["mini project task"],
      "interview": ["what to explain before interview"]
    }
  ]
}

Create exactly 4 weeks.
Keep every item short and practical.
`,
      },
    ],
  });

  const raw = aiResponse.choices[0]?.message?.content ?? "{}";
  const result = parseRoadmapResponse(raw);

  const roadmap = await prisma.roadmap.create({
    data: {
      userId: user.id,
      sessionId: interview.id,
      title: result.title,
      summary: result.summary,
      weeks: {
        create: result.weeks.map((week) => ({
          weekNumber: week.weekNumber,
          title: week.title,
          goal: week.goal,
          description: week.description,
          items: {
            create: [
              ...week.topics.map((text) => ({
                section: "TOPICS" as const,
                text,
              })),
              ...week.practice.map((text) => ({
                section: "PRACTICE" as const,
                text,
              })),
              ...week.project.map((text) => ({
                section: "PROJECT" as const,
                text,
              })),
              ...week.interview.map((text) => ({
                section: "INTERVIEW" as const,
                text,
              })),
            ],
          },
        })),
      },
    },
  });

  redirect(`/roadmaps/${roadmap.id}`);
}
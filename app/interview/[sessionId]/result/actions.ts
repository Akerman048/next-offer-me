"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { redirect } from "next/navigation";

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
  });

  const interview = await prisma.interviewSession.findFirstOrThrow({
    where: {
      id: sessionId,
      userId: user.id,
    },
    include: {
      answers: {
        where: {
          aiScore: {
            lt: 8,
          },
        },
        include: {
          question: {
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

const cleaned = raw
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const result = JSON.parse(cleaned) as {
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
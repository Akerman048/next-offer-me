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
          "You are an expert programming mentor. Create a practical learning roadmap based on weak interview answers.",
      },
      {
        role: "user",
        content: `Create a clean 4-week learning roadmap based on these weak interview answers.

Weak answers:
${weakAnswersText}

Return Markdown only.

Use this exact structure:

# 4-Week Learning Roadmap

## Week 1: Title

### Goal
Short goal for the week.

### Topics to review
- Topic 1
- Topic 2
- Topic 3

### Practice tasks
- Task 1
- Task 2
- Task 3

### Mini project
Short project idea.

### Before next interview
- What to repeat
- What to explain out loud

---

## Week 2: Title

Use the same structure for Week 2, Week 3 and Week 4.

Make it concise, readable, and practical.
Do not write long paragraphs.
Do not use tables.
`,
      },
    ],
  });

  const content =
    aiResponse.choices[0]?.message?.content ?? "No roadmap generated.";

  const roadmap = await prisma.roadmap.create({
    data: {
      userId: user.id,
      sessionId: interview.id,
      title: "Interview improvement roadmap",
      content,
    },
  });

  redirect(`/roadmaps/${roadmap.id}`);
}
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

type Props = {
  params: Promise<{
    slug: string;
    lessonSlug: string;
  }>;
};

export default async function LessonPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { slug, lessonSlug } = await params;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: session.user.email,
    },
  });

  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      topic: {
        slug,
      },
    },
    include: {
      parts: {
        orderBy: {
          order: "asc",
        },
        include: {
          progress: {
            where: {
              userId: user.id,
              completed: true,
            },
          },
        },
      },
    },
  });

  if (!lesson || lesson.parts.length === 0) {
    notFound();
  }

  const firstIncompletePart = lesson.parts.find(
    (part) => part.progress.length === 0,
  );

  const targetPart = firstIncompletePart ?? lesson.parts[0];

  redirect(`/topics/${slug}/${lessonSlug}/${targetPart.id}`);
}
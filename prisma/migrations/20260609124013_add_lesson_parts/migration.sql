/*
  Warnings:

  - You are about to drop the column `answer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `UserProgress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,lessonPartId]` on the table `UserProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonPartId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prompt` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessonPartId` to the `UserProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_questionId_fkey";

-- DropIndex
DROP INDEX "UserProgress_userId_questionId_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answer",
DROP COLUMN "explanation",
DROP COLUMN "lessonId",
ADD COLUMN     "lessonPartId" TEXT NOT NULL,
ADD COLUMN     "prompt" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "questionId",
ADD COLUMN     "lessonPartId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "LessonPart" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_lessonPartId_key" ON "UserProgress"("userId", "lessonPartId");

-- AddForeignKey
ALTER TABLE "LessonPart" ADD CONSTRAINT "LessonPart_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_lessonPartId_fkey" FOREIGN KEY ("lessonPartId") REFERENCES "LessonPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_lessonPartId_fkey" FOREIGN KEY ("lessonPartId") REFERENCES "LessonPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

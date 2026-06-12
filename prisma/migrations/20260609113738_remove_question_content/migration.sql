/*
  Warnings:

  - You are about to drop the column `expectedAnswer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `task` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "expectedAnswer",
DROP COLUMN "task";

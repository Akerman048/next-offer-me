CREATE TABLE "RateLimit" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RateLimit_userId_action_key" ON "RateLimit"("userId", "action");

CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");

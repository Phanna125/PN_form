-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "lockdownBrowser" BOOLEAN NOT NULL DEFAULT true,
    "clipboardLock" BOOLEAN NOT NULL DEFAULT true,
    "blackoutMode" BOOLEAN NOT NULL DEFAULT true,
    "screenshotDetection" BOOLEAN NOT NULL DEFAULT true,
    "aiFocusLogs" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "options" JSONB NOT NULL,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamSession" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "focusScore" INTEGER NOT NULL DEFAULT 100,
    "focusLossCount" INTEGER NOT NULL DEFAULT 0,
    "blockedClipboardActions" INTEGER NOT NULL DEFAULT 0,
    "integrityFlags" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionEvent" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exam_status_idx" ON "public"."Exam"("status");

-- CreateIndex
CREATE INDEX "ExamQuestion_examId_order_idx" ON "public"."ExamQuestion"("examId", "order");

-- CreateIndex
CREATE INDEX "ExamSession_examId_updatedAt_idx" ON "public"."ExamSession"("examId", "updatedAt");

-- CreateIndex
CREATE INDEX "SessionEvent_sessionId_at_idx" ON "public"."SessionEvent"("sessionId", "at");

-- CreateIndex
CREATE INDEX "SessionEvent_examId_sessionId_idx" ON "public"."SessionEvent"("examId", "sessionId");

-- AddForeignKey
ALTER TABLE "public"."ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamSession" ADD CONSTRAINT "ExamSession_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionEvent" ADD CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

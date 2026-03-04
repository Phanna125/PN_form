import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EXAM_ID = "exam-demo-physics";
const DEMO_SESSION_ID = "session-demo-alex-chen";

async function main() {
  const timestamp = new Date();

  await prisma.exam.upsert({
    where: { id: DEMO_EXAM_ID },
    update: {},
    create: {
      id: DEMO_EXAM_ID,
      title: "Mid-Term Physics Exam",
      course: "Physics 101",
      status: "draft",
      durationMinutes: 90,
      lockdownBrowser: true,
      clipboardLock: true,
      blackoutMode: true,
      screenshotDetection: true,
      aiFocusLogs: true,
      createdAt: timestamp,
      questions: {
        create: [
          {
            id: "q-demo-1",
            type: "essay",
            prompt: "Explain Newton's Third Law in your own words.",
            points: 10,
            order: 0,
            options: [],
          },
          {
            id: "q-demo-2",
            type: "mcq",
            prompt: "Calculate velocity after 5 seconds if g = 9.8m/s^2.",
            points: 5,
            order: 1,
            options: ["49 m/s", "49 m/s^2", "9.8 m/s"],
          },
        ],
      },
    },
  });

  await prisma.examSession.upsert({
    where: { id: DEMO_SESSION_ID },
    update: {},
    create: {
      id: DEMO_SESSION_ID,
      examId: DEMO_EXAM_ID,
      studentName: "Alex Chen",
      studentId: "#8920194",
      status: "active",
      focusScore: 100,
      focusLossCount: 0,
      blockedClipboardActions: 0,
      integrityFlags: 0,
      startedAt: timestamp,
    },
  });

  await prisma.sessionEvent.upsert({
    where: { id: "event-demo-started" },
    update: {},
    create: {
      id: "event-demo-started",
      examId: DEMO_EXAM_ID,
      sessionId: DEMO_SESSION_ID,
      type: "session-started",
      detail: "Secure session initialized with active guard policies.",
      severity: "info",
      at: timestamp,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

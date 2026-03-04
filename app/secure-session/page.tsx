"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardX,
  EyeOff,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { DEMO_EXAM_ID, DEMO_SESSION_ID } from "@/lib/shared/demo";
import styles from "./page.module.css";

type LogTone = "neutral" | "good" | "warn";

type SessionLog = {
  id: string;
  time: string;
  title: string;
  detail: string;
  tone: LogTone;
};

type BackendEventSeverity = "info" | "warn" | "critical";
type BackendEventType =
  | "session-started"
  | "focus-loss"
  | "clipboard-block"
  | "screenshot-attempt"
  | "manual-note"
  | "face-verified";

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SecureSessionPage() {
  const startedRef = useRef(false);
  const [clipboardLock, setClipboardLock] = useState(true);
  const [blackoutMode, setBlackoutMode] = useState(true);
  const [screenshotDetection, setScreenshotDetection] = useState(true);
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [blockedClipboardActions, setBlockedClipboardActions] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);
  const [logs, setLogs] = useState<SessionLog[]>([
    {
      id: "boot",
      time: nowLabel(),
      title: "Secure session started",
      detail: "Guard listeners initialized and policies synced.",
      tone: "good",
    },
  ]);

  const addLog = useCallback((title: string, detail: string, tone: LogTone = "neutral") => {
    setLogs((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        time: nowLabel(),
        title,
        detail,
        tone,
      },
      ...current.slice(0, 11),
    ]);
  }, []);

  const reportEvent = useCallback(
    async (
      type: BackendEventType,
      detail: string,
      severity: BackendEventSeverity = "warn"
    ) => {
      try {
        await fetch(`/api/v1/exams/${DEMO_EXAM_ID}/sessions/${DEMO_SESSION_ID}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, detail, severity }),
        });
      } catch {
        // Keep the local demo usable if backend calls fail.
      }
    },
    []
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void reportEvent("manual-note", "Secure session demo was opened.", "info");
  }, [reportEvent]);

  const triggerBlackout = useCallback(() => {
    if (!blackoutMode) return;
    setIsBlackout(true);
    window.setTimeout(() => setIsBlackout(false), 1600);
  }, [blackoutMode]);

  useEffect(() => {
    const clipboardHandler = (event: ClipboardEvent) => {
      if (!clipboardLock) return;
      event.preventDefault();
      setBlockedClipboardActions((count) => count + 1);
      addLog("Clipboard blocked", "Copy/paste action prevented by Guard policy.", "warn");
      void reportEvent("clipboard-block", "Copy/paste action prevented by Guard policy.");
      triggerBlackout();
    };

    const focusLossHandler = () => {
      setFocusLossCount((count) => count + 1);
      addLog("Focus loss detected", "Student switched tab or moved away from exam window.", "warn");
      void reportEvent("focus-loss", "Student switched tab or moved away from exam window.");
      triggerBlackout();
    };

    const visibilityHandler = () => {
      if (document.hidden) {
        focusLossHandler();
      }
    };

    const screenshotHandler = (event: KeyboardEvent) => {
      if (!screenshotDetection) return;
      const key = event.key.toLowerCase();
      const isPossibleCapture =
        event.key === "PrintScreen" || (event.ctrlKey && event.shiftKey && key === "s");

      if (isPossibleCapture) {
        addLog(
          "Possible screenshot attempt",
          "Capture shortcut detected. Preview is temporarily blacked out.",
          "warn"
        );
        void reportEvent(
          "screenshot-attempt",
          "Capture shortcut detected. Preview was temporarily blacked out."
        );
        triggerBlackout();
      }
    };

    document.addEventListener("copy", clipboardHandler);
    document.addEventListener("cut", clipboardHandler);
    document.addEventListener("paste", clipboardHandler);
    document.addEventListener("visibilitychange", visibilityHandler);
    window.addEventListener("blur", focusLossHandler);
    window.addEventListener("keydown", screenshotHandler);

    return () => {
      document.removeEventListener("copy", clipboardHandler);
      document.removeEventListener("cut", clipboardHandler);
      document.removeEventListener("paste", clipboardHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);
      window.removeEventListener("blur", focusLossHandler);
      window.removeEventListener("keydown", screenshotHandler);
    };
  }, [addLog, clipboardLock, reportEvent, screenshotDetection, triggerBlackout]);

  const focusScore = useMemo(
    () => Math.max(48, 100 - focusLossCount * 6 - blockedClipboardActions * 2),
    [blockedClipboardActions, focusLossCount]
  );

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.left}>
          <Link href="/dashboard" className={styles.back}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1>PN_form Secure Session Demo</h1>
        </div>
        <p>
          Policy simulation: screenshot detection uses shortcut heuristics (PrintScreen /
          Ctrl+Shift+S)
        </p>
      </header>

      <main className={styles.grid}>
        <section className={styles.examArea}>
          {isBlackout && (
            <div className={styles.blackout}>
              <EyeOff size={28} />
              <p>Screen Privacy Mode Active</p>
            </div>
          )}

          <article className={styles.card}>
            <div className={styles.cardHead}>
              <h2>Calculus 101 - Final Exam</h2>
              <span>
                <Timer size={14} /> 44:29 remaining
              </span>
            </div>
            <p className={styles.prompt}>
              Explain the difference between a derivative and an integral in practical
              terms.
            </p>
            <textarea placeholder="Student answer area..." />
          </article>

          <article className={styles.card}>
            <h3>Guard Policies</h3>
            <div className={styles.toggles}>
              <label>
                <input
                  type="checkbox"
                  checked={clipboardLock}
                  onChange={(event) => setClipboardLock(event.target.checked)}
                />
                <span>Clipboard Lock (disable copy/paste)</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={blackoutMode}
                  onChange={(event) => setBlackoutMode(event.target.checked)}
                />
                <span>Blackout Mode on violation</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={screenshotDetection}
                  onChange={(event) => setScreenshotDetection(event.target.checked)}
                />
                <span>Screenshot Shortcut Detection</span>
              </label>
            </div>
          </article>
        </section>

        <aside className={styles.sidebar}>
          <article className={styles.card}>
            <h3>Session Health</h3>
            <div className={styles.stats}>
              <p>
                <ShieldCheck size={15} /> Focus Score <strong>{focusScore}%</strong>
              </p>
              <p>
                <AlertTriangle size={15} /> Focus-Loss Events <strong>{focusLossCount}</strong>
              </p>
              <p>
                <ClipboardX size={15} /> Clipboard Blocks{" "}
                <strong>{blockedClipboardActions}</strong>
              </p>
            </div>
          </article>

          <article className={styles.card}>
            <h3>Live Proctoring Logs</h3>
            <ul className={styles.logs}>
              {logs.map((entry) => (
                <li key={entry.id} className={styles[entry.tone]}>
                  <div>
                    <strong>{entry.title}</strong>
                    <small>{entry.time}</small>
                  </div>
                  <p>{entry.detail}</p>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </main>
    </div>
  );
}

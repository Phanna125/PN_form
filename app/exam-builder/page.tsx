import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Info,
  LayoutDashboard,
  Monitor,
  PencilLine,
  Plus,
  RotateCcw,
  ShieldCheck,
  Users,
  Activity,
} from "lucide-react";
import styles from "./page.module.css";

const questionCards = [
  {
    type: "Question 1 - Essay",
    title: "Explain Newton's Third Law in your own words.",
    points: "10 Points",
    time: "Approx 5 min",
    mode: "essay",
  },
  {
    type: "Question 2 - Multiple Choice",
    title: "Calculate the velocity of an object falling for 5 seconds (g=9.8m/s^2).",
    points: "5 Points",
    time: "Approx 2 min",
    mode: "mcq",
  },
];

const guardSettings = [
  {
    title: "Lockdown Browser",
    description: "Forces fullscreen and prevents tab switching.",
    enabled: true,
  },
  {
    title: "Disable Copy/Paste",
    description: "Prevents clipboard actions inside the exam window.",
    enabled: true,
  },
  {
    title: "Screen Blackout",
    description: "Blacks out content if screenshot tools are detected.",
    enabled: false,
    badge: "Beta",
  },
];

const aiSettings = [
  {
    title: "Focus-Loss Logs",
    description: "Track when student looks away from screen or leaves tab.",
    enabled: true,
  },
  {
    title: "Audio Environment Scan",
    description: "Upgrade to premium to enable audio analysis.",
    enabled: false,
    locked: true,
  },
];

export default function ExamBuilderPage() {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.leftHead}>
          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>
              <FileText size={18} />
            </div>
            <span>PN_form</span>
          </Link>
          <nav>
            <Link href="/dashboard">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link href="/exam-builder" className={styles.active}>
              <ClipboardList size={16} /> Exam Builder
            </Link>
            <a href="#">
              <Users size={16} /> Students
            </a>
          </nav>
        </div>

        <div className={styles.rightHead}>
          <div className={styles.saved}>
            <small>Status</small>
            <span>
              <CheckCircle2 size={14} /> Saved 2m ago
            </span>
          </div>
          <button className={styles.preview}>
            <Eye size={16} /> Preview
          </button>
          <button className={styles.publish}>Publish Exam</button>
          <div className={styles.avatar}>AR</div>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.rail}>
          <button className={styles.primaryRail}>
            <Plus size={20} />
          </button>
          <button>
            <ClipboardList size={19} />
          </button>
          <button>
            <ShieldCheck size={19} />
          </button>
          <button>
            <Monitor size={19} />
          </button>
        </aside>

        <main className={styles.builder}>
          <section className={styles.examHead}>
            <div>
              <div className={styles.chips}>
                <span className={styles.purple}>Physics 101</span>
                <span className={styles.amber}>Draft</span>
              </div>
              <h1>Mid-Term Physics Exam</h1>
              <p>
                Build your assessment by adding questions below. All changes are saved
                automatically. Ensure security settings are configured before publishing.
              </p>
            </div>
            <button>
              <PencilLine size={16} /> Edit Details
            </button>
          </section>

          <section className={styles.questionList}>
            {questionCards.map((card) => (
              <article className={styles.questionCard} key={card.type}>
                <p className={styles.type}>{card.type}</p>
                <h2>{card.title}</h2>

                {card.mode === "essay" ? (
                  <div className={styles.answerArea}>Student answer area...</div>
                ) : (
                  <div className={styles.options}>
                    <button>49 m/s</button>
                    <button className={styles.correct}>49 m/s^2</button>
                    <button>9.8 m/s</button>
                  </div>
                )}

                <div className={styles.meta}>
                  <span>{card.points}</span>
                  <span>
                    <Clock3 size={14} /> {card.time}
                  </span>
                  <a href="#">Edit Question</a>
                </div>
              </article>
            ))}
          </section>

          <button className={styles.addQuestion}>
            <Plus size={24} />
          </button>
        </main>

        <aside className={styles.guardPanel}>
          <section className={styles.guardHead}>
            <div className={styles.guardIcon}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2>The Guard</h2>
              <p>Security Configuration</p>
            </div>
          </section>

          <article className={styles.infoCallout}>
            <Info size={18} />
            <p>
              Strict mode is recommended for Mid-Term exams. AI proctoring may require
              camera permissions.
            </p>
          </article>

          <section className={styles.settingGroup}>
            <h3>
              <Monitor size={16} /> Browser and Device
            </h3>
            {guardSettings.map((setting) => (
              <div className={styles.settingItem} key={setting.title}>
                <div>
                  <h4>
                    {setting.title}
                    {setting.badge ? <span>{setting.badge}</span> : null}
                  </h4>
                  <p>{setting.description}</p>
                </div>
                <span
                  className={`${styles.switch} ${
                    setting.enabled ? styles.enabled : styles.disabled
                  }`}
                >
                  <i />
                </span>
              </div>
            ))}
          </section>

          <section className={styles.settingGroup}>
            <h3>
              <Activity size={16} /> AI Proctoring
            </h3>
            {aiSettings.map((setting) => (
              <div className={styles.settingItem} key={setting.title}>
                <div>
                  <h4>
                    {setting.title}
                    {setting.locked ? <EyeOff size={14} /> : null}
                  </h4>
                  <p>{setting.description}</p>
                </div>
                <span
                  className={`${styles.switch} ${
                    setting.enabled ? styles.enabled : styles.disabled
                  }`}
                >
                  <i />
                </span>
              </div>
            ))}
          </section>

          <button className={styles.reset}>
            <RotateCcw size={15} /> Reset to Default
          </button>
        </aside>
      </div>
    </div>
  );
}

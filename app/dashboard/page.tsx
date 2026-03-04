import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookCopy,
  CircleHelp,
  ClipboardList,
  FileText,
  FileWarning,
  Home,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import styles from "./page.module.css";

const toolbox = [
  {
    title: "PN_form Docs",
    text: "Collaborative writing and grading in one editor.",
    icon: FileText,
    href: "#",
  },
  {
    title: "PN_form Exams",
    text: "Secure test delivery with exam-level guard policies.",
    icon: ClipboardList,
    href: "/exam-builder",
  },
  {
    title: "The Guard",
    text: "Real-time browser security and proctoring controls.",
    icon: Shield,
    href: "/guard/live",
  },
  {
    title: "PN_form Logs",
    text: "Focus-loss history and integrity logs for review.",
    icon: FileWarning,
    href: "/guard/live",
  },
];

const activities = [
  {
    title: "Math Final Exam Posted",
    meta: "Class 4B - 2 hours ago",
    detail: "Draft saved",
    tone: "blue",
  },
  {
    title: "Session 101 Completed",
    meta: "Physics 101 - 4 hours ago",
    detail: "32 students submitted",
    tone: "green",
  },
  {
    title: "Log Generated",
    meta: "System - 5 hours ago",
    detail: "Automatic proctoring report ready",
    tone: "orange",
  },
  {
    title: "Syllabus Updated",
    meta: "English Lit - yesterday",
    detail: "Version 1.3 now live",
    tone: "gray",
  },
];

export default function DashboardPage() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <BookCopy size={18} />
          </div>
          <div>
            <strong>PN_form</strong>
            <span>Educational Ecosystem</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.active}>
            <Home size={18} /> Home
          </Link>
          <a href="#">
            <FileText size={18} /> PN_form Docs
          </a>
          <Link href="/exam-builder">
            <ClipboardList size={18} /> PN_form Exams
          </Link>
          <Link href="/guard/live">
            <Shield size={18} /> The Guard
          </Link>
        </nav>

        <h4>Workspace</h4>
        <nav className={styles.nav}>
          <a href="#">
            <Users size={18} /> Students
          </a>
          <a href="#">
            <BarChart3 size={18} /> Analytics
          </a>
        </nav>

        <button className={styles.quickCreate}>
          <Plus size={18} /> Quick Create
        </button>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <label className={styles.search}>
            <Search size={17} />
            <input placeholder="Search docs, students, or PN_form exams..." />
          </label>
          <div className={styles.topActions}>
            <button>
              <Bell size={19} />
            </button>
            <button>
              <CircleHelp size={19} />
            </button>
            <div className={styles.avatar}>JV</div>
          </div>
        </header>

        <main className={styles.content}>
          <section className={styles.greeting}>
            <h1>Good morning, Professor.</h1>
            <p>
              <span className={styles.dot} /> Your classrooms are secure and systems are
              operational.
            </p>
          </section>

          <section className={styles.statsGrid}>
            <article className={styles.card}>
              <div className={styles.cardTop}>
                <h3>The Guard Status</h3>
                <span className={styles.secureTag}>Secure</span>
              </div>
              <p className={styles.metric}>3 Active Sessions</p>
              <p className={styles.sub}>
                Real-time browser security active across all sessions.
              </p>
              <div className={styles.progress}>
                <span />
              </div>
            </article>

            <article className={styles.card}>
              <div className={styles.cardTop}>
                <h3>Students Online</h3>
                <span className={styles.increase}>+12</span>
              </div>
              <p className={styles.metric}>84 Total Users</p>
              <p className={styles.sub}>Across live classes and active exam sessions.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardTop}>
                <h3>Needs Review</h3>
                <FileWarning size={18} />
              </div>
              <p className={styles.metric}>5 Exam Logs</p>
              <Link href="/guard/live" className={styles.inlineLink}>
                View Logs
              </Link>
            </article>
          </section>

          <section className={styles.workspace}>
            <div className={styles.toolboxPanel}>
              <div className={styles.panelHead}>
                <h2>Your Toolbox</h2>
                <button>Customize</button>
              </div>

              <div className={styles.toolboxGrid}>
                {toolbox.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link href={item.href} key={item.title} className={styles.toolboxCard}>
                      <div className={styles.toolboxIcon}>
                        <Icon size={18} />
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className={styles.activityPanel}>
              <div className={styles.panelHead}>
                <h2>Recent Activity</h2>
                <button>View All</button>
              </div>

              <ul>
                {activities.map((item) => (
                  <li key={item.title}>
                    <span className={`${styles.node} ${styles[item.tone]}`} />
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.meta}</p>
                      <small>{item.detail}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div>
              <button>
                <Plus size={16} /> Start New Exam
              </button>
              <button>
                <FileText size={16} /> Upload Material
              </button>
              <button>
                <Users size={16} /> Invite Student
              </button>
              <button>
                <ShieldCheck size={16} /> Configure Guard
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

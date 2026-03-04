import Link from "next/link";
import {
  Activity,
  AlarmClock,
  Bell,
  Camera,
  Clipboard,
  CopyX,
  EyeOff,
  FileBarChart,
  Gauge,
  Mic,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import styles from "./page.module.css";

const protocolItems = [
  {
    title: "Screenshot Detection",
    subtitle: "Prevents external capture tools",
    icon: Clipboard,
    enabled: true,
  },
  {
    title: "Clipboard Lock",
    subtitle: "Disables copy/paste actions",
    icon: CopyX,
    enabled: true,
  },
  {
    title: "Blackout Mode",
    subtitle: "Hides screen on focus loss",
    icon: EyeOff,
    enabled: false,
  },
  {
    title: "AI Proctor",
    subtitle: "Auto-flags suspicious gaze",
    icon: Activity,
    enabled: true,
  },
];

const timelineItems = [
  {
    time: "Current Time (10:45 AM)",
    text: "System is logging all inputs. Focus level is steady.",
    tone: "active",
  },
  {
    time: "10:40 AM",
    text: "Question 14 answered. Face verification matched.",
    tone: "good",
  },
  {
    time: "10:32 AM - Focus Loss Detected",
    text: "Student gaze shifted away from screen for extended period.",
    tone: "warning",
  },
];

const diagnostics = [
  { label: "Latency", value: "24ms" },
  { label: "Bandwidth", value: "45 Mbps" },
  { label: "CPU Usage", value: "12%" },
  { label: "Battery", value: "98% (Plugged In)" },
];

export default function GuardLivePage() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <ShieldCheck size={18} />
          </div>
          <span>The Guard</span>
        </Link>

        <nav className={styles.nav}>
          <a href="#">
            <Clipboard size={18} /> Dashboard
          </a>
          <Link href="/guard/live" className={styles.active}>
            <Clipboard size={18} /> Active Exams
          </Link>
          <a href="#">
            <Users size={18} /> Student Roster
          </a>
          <a href="#">
            <FileBarChart size={18} /> Reports
          </a>
          <a href="#">
            <Settings size={18} /> Settings
          </a>
        </nav>

        <div className={styles.helpCard}>
          <h4>Help Center</h4>
          <p>Need assistance with a protocol?</p>
          <button>Contact Support</button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.crumbs}>PN_form Ecosystem / Calculus 101 / Final Exam</div>

          <label className={styles.search}>
            <Search size={16} />
            <input placeholder="Search student or ID..." />
          </label>

          <div className={styles.topMeta}>
            <Bell size={18} />
            <div className={styles.profile}>
              <strong>Dr. Sarah Vance</strong>
              <small>Chief Proctor</small>
            </div>
            <div className={styles.avatar}>SV</div>
          </div>
        </header>

        <main className={styles.content}>
          <section className={styles.studentBar}>
            <div className={styles.studentInfo}>
              <div className={styles.studentAvatar}>
                <UserRound size={28} />
                <span />
              </div>
              <div>
                <h1>Alex Chen</h1>
                <p>ID: #8920194 • Calculus 101 Final</p>
              </div>
              <span className={styles.livePill}>Live Monitoring</span>
            </div>

            <div className={styles.sessionActions}>
              <button>Full History</button>
              <button className={styles.terminate}>Terminate Session</button>
            </div>
          </section>

          <section className={styles.metrics}>
            <article>
              <div>
                <h4>Focus Score</h4>
                <Gauge size={18} />
              </div>
              <strong>94%</strong>
              <p className={styles.good}>Stable engagement</p>
            </article>

            <article>
              <div>
                <h4>Integrity Flags</h4>
                <Shield size={18} />
              </div>
              <strong>2</strong>
              <p className={styles.warning}>Review required</p>
            </article>

            <article>
              <div>
                <h4>Time Remaining</h4>
                <AlarmClock size={18} />
              </div>
              <strong>45:00</strong>
              <div className={styles.bar}>
                <span />
              </div>
            </article>

            <article>
              <div>
                <h4>Environment</h4>
                <ShieldCheck size={18} />
              </div>
              <strong className={styles.env}>Secure Connection</strong>
              <p>IP: 192.168.1.45 (Verified)</p>
            </article>
          </section>

          <section className={styles.workspace}>
            <div className={styles.leftCol}>
              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>
                    <ShieldCheck size={20} /> Active Security Protocols
                  </h2>
                  <button>Configure All</button>
                </div>

                <div className={styles.protocolGrid}>
                  {protocolItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div className={styles.protocolItem} key={item.title}>
                        <div className={styles.protocolIcon}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.subtitle}</p>
                        </div>
                        <span
                          className={`${styles.toggle} ${item.enabled ? styles.on : styles.off}`}
                        >
                          <i />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>Session Timeline</h2>
                  <span className={styles.legend}>Normal • Warning • Violation</span>
                </div>

                <ul className={styles.timeline}>
                  {timelineItems.map((item) => (
                    <li key={item.time} className={styles[item.tone]}>
                      <span className={styles.timelineDot} />
                      <div>
                        <h3>{item.time}</h3>
                        <p>{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <aside className={styles.rightCol}>
              <article className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>Live Proctor View</h2>
                  <Settings size={16} />
                </div>

                <div className={styles.previewCard}>
                  <div>
                    <EyeOff size={30} />
                    <p>Screen Privacy Mode Active</p>
                  </div>
                </div>

                <div className={styles.webcamCard}>
                  <Camera size={44} />
                  <span>Webcam Feed</span>
                </div>

                <div className={styles.liveActions}>
                  <button>
                    <Mic size={16} /> Mute
                  </button>
                  <button className={styles.dark}>Message</button>
                </div>
              </article>

              <article className={styles.panel}>
                <h2>Device Diagnostics</h2>
                <ul className={styles.diagList}>
                  {diagnostics.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

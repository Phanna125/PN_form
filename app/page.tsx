import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ClipboardCheck,
  EyeOff,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import styles from "./page.module.css";

const suiteCards = [
  {
    title: "The Guard",
    text: "Active anti-cheating controls with screenshot privacy mode and clipboard lock.",
    icon: ShieldCheck,
    link: "/guard/live",
    cta: "Open live monitor",
  },
  {
    title: "PN_form Logs",
    text: "Humanized focus-loss timelines that help instructors review behavior with context.",
    icon: Activity,
    link: "/dashboard",
    cta: "View dashboard",
  },
  {
    title: "PN_form Exams",
    text: "Build assessments with integrated security settings before publishing to students.",
    icon: ClipboardCheck,
    link: "/exam-builder",
    cta: "Go to exam builder",
  },
];

const integrations = ["Canvas", "Blackboard", "Moodle", "Google Classroom"];

export default function Home() {
  return (
    <div className={styles.marketing}>
      <header className={styles.navWrap}>
        <div className={`container ${styles.navInner}`}>
          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>
              <Layers size={18} />
            </div>
            <span>PN_form</span>
          </Link>

          <nav className={styles.navLinks}>
            <Link href="#suite">Suite</Link>
            <Link href="#guard">The Guard</Link>
            <Link href="#integrations">Integrations</Link>
            <Link href="/dashboard">Product Tour</Link>
          </nav>

          <div className={styles.navActions}>
            <Link className="btn btnGhost" href="/dashboard">
              Sign In
            </Link>
            <Link className="btn btnPrimary" href="/exam-builder">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={`container ${styles.hero}`}>
          <div>
            <span className={styles.kicker}>
              <Sparkles size={14} /> New standard in education software
            </span>
            <h1 className={styles.headline}>
              The Unified Digital Ecosystem
              <br />
              for Modern Schools
            </h1>
            <p className={styles.blurb}>
              PN_form replaces fragmented tools with one secure, human-centered suite.
              Docs, exams, proctoring, and activity logs work together in a single
              workflow.
            </p>

            <div className={styles.heroCtas}>
              <Link className="btn btnPrimary" href="/dashboard">
                Explore the Suite <ArrowRight size={16} />
              </Link>
              <Link className="btn btnGhost" href="/guard/live">
                Watch Guard Live
              </Link>
            </div>

            <div className={styles.heroSignals}>
              <div>
                <strong>99.8%</strong>
                <span>Exam uptime</span>
              </div>
              <div>
                <strong>2M+</strong>
                <span>Sessions secured</span>
              </div>
              <div>
                <strong>40%</strong>
                <span>Fewer support incidents</span>
              </div>
            </div>
          </div>

          <div className={styles.heroCanvas}>
            <div className={styles.windowTop}>
              <span />
              <span />
              <span />
            </div>

            <div className={styles.canvasGrid}>
              <div className={styles.canvasCard}>
                <ShieldCheck size={18} />
                <div>
                  <h3>Active Protection</h3>
                  <p>Screenshot detection and blur mode engaged.</p>
                </div>
              </div>
              <div className={styles.canvasCard}>
                <EyeOff size={18} />
                <div>
                  <h3>Screen Privacy</h3>
                  <p>Preview hidden if external capture tools are detected.</p>
                </div>
              </div>
              <div className={`${styles.canvasCard} ${styles.wide}`}>
                <BrainCircuit size={18} />
                <div>
                  <h3>Focus-Loss Intelligence</h3>
                  <p>
                    Contextual proctoring logs track tab switches, idle behavior, and
                    suspicious patterns in real time.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.floatBadgeA}>Exam Secure</div>
            <div className={styles.floatBadgeB}>Student Experience Optimized</div>
          </div>
        </section>

        <section className={`container ${styles.trustBar}`}>
          <p>Trusted by forward-looking institutions</p>
          <div className={styles.logoRow}>
            {integrations.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className={styles.suiteSection} id="suite">
          <div className="container">
            <div className={styles.sectionTitle}>
              <h2>Meet the PN_form Suite</h2>
              <p>
                Every module lives in the same ecosystem, so students and instructors
                stay in one secure environment from setup to grading.
              </p>
            </div>

            <div className={styles.cardGrid}>
              {suiteCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                      <Icon size={20} />
                    </div>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                    <Link href={card.link}>
                      {card.cta} <ArrowRight size={14} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`container ${styles.flowSection}`} id="guard">
          <div className={styles.flowCard}>
            <h3>Inside The Guard</h3>
            <p>
              Strict anti-cheating policies are configurable per exam. Lockdown browser,
              clipboard block, screenshot blackouts, and AI behavior checks all run from
              one control center.
            </p>
            <ul>
              <li>
                <BookOpen size={16} /> Instructor presets for different exam types
              </li>
              <li>
                <Activity size={16} /> Real-time focus loss visibility with proctor
                alerts
              </li>
              <li>
                <Network size={16} /> Secure logs shared across the suite for auditing
              </li>
            </ul>
            <div className={styles.flowCtas}>
              <Link className="btn btnDark" href="/guard/live">
                Open Proctor Monitor
              </Link>
              <Link className="btn btnGhost" href="/exam-builder">
                Configure Exam Security
              </Link>
              <Link className="btn btnGhost" href="/secure-session">
                Try Secure Session Demo
              </Link>
            </div>
          </div>

          <div className={styles.flowPreview} id="integrations">
            <div className={styles.previewHeader}>Live Ecosystem View</div>
            <div className={styles.previewItem}>
              <span className={styles.dotGreen} />
              <p>Math Final: 84 students online, 3 active sessions in strict mode.</p>
            </div>
            <div className={styles.previewItem}>
              <span className={styles.dotBlue} />
              <p>Exam Builder synced new policy: disable copy/paste and tab switching.</p>
            </div>
            <div className={styles.previewItem}>
              <span className={styles.dotOrange} />
              <p>1 focus-loss incident flagged. Snapshot linked to instructor timeline.</p>
            </div>
            <div className={styles.previewStack}>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/guard/live">Guard Monitor</Link>
              <Link href="/exam-builder">Exam Builder</Link>
            </div>
          </div>
        </section>

        <section className={`container ${styles.quoteBand}`}>
          <blockquote>
            &quot;PN_form shifted our exams from surveillance to support. The interface is
            intuitive, and technical incidents dropped by 40% in the first semester.&quot;
          </blockquote>
          <p>Dr. Sarah Jenkins, Dean of Digital Learning</p>
        </section>

        <section className={styles.finalCta}>
          <div className="container">
            <h2>Ready to modernize assessment workflows?</h2>
            <p>
              Join institutions replacing fragmented tools with one secure ecosystem
              built for integrity, speed, and student trust.
            </p>
            <div className={styles.heroCtas}>
              <Link className="btn btnPrimary" href="/dashboard">
                Launch Product Tour
              </Link>
              <Link className="btn btnGhost" href="/exam-builder">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div>
            <div className={styles.brand}>
              <div className={styles.brandMark}>
                <Layers size={18} />
              </div>
              <span>PN_form</span>
            </div>
            <p>
              A unified educational ecosystem returning integrity and humanity to digital
              exams.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <Link href="/guard/live">The Guard</Link>
            <Link href="/dashboard">Proctoring Logs</Link>
            <Link href="/exam-builder">Integrations</Link>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

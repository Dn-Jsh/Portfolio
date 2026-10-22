import { ArrowUpRight, Compass, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { StoryDeck } from "@/components/about/StoryDeck";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { EXPERIENCE } from "@/data/experience";
import { getPublicPageMetadata } from "@/lib/seo";

export const metadata = getPublicPageMetadata("/about");

const VALUES = [
  {
    number: "01",
    title: "Stay curious",
    description: "I learn by building, asking questions, and working through the parts I don’t understand yet.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Make it useful",
    description: "I want the apps I build to help someone get something done, with fewer steps and less friction.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Share the process",
    description: "I write about what I’m making, including the tools, decisions, and lessons along the way.",
    icon: Heart,
  },
];

const MILESTONES = [
  {
    year: "Now",
    label: "Personal project",
    title: "Anointed Worship",
    description:
      "I’m building a shared space for worship teams to prepare service plans, chord charts, lyrics, and schedules. It brings my interest in music together with the software I make.",
    tags: ["Next.js", "TypeScript", "Supabase"],
  },
  ...EXPERIENCE.map((experience) => ({
    year: experience.period,
    label: experience.company,
    title: experience.role,
    description: experience.description,
    tags: experience.skills,
  })),
];

export default function AboutPage() {
  return (
    <div className="about-page page-enter">
      <ScrollReveal className="about-hero-reveal" direction="scale">
        <section className="about-hero" aria-labelledby="about-title">
          <div className="about-topline">
            <span className="page-kicker">
              <span aria-hidden="true" className="page-kicker-mark" />
              DAN JESHUA / ABOUT
            </span>
            <span className="about-profile-tag">
              <span aria-hidden="true" className="about-profile-dot" />
              BEYOND CODE
            </span>
          </div>

          <div className="about-hero-grid">
            <div className="about-copy">
              <p className="about-role">FULL-STACK DEVELOPER <span>·</span> BSIT / PUP</p>
              <h1 id="about-title" className="about-title page-title font-bold">
                More about
                <span className="about-title-last-line">
                  me<span className="about-title-period">.</span>
                </span>
              </h1>
              <p className="about-lede">
                Hi, I’m Dan Jeshua, also known as dnjsh. I’m a fourth-year BSIT
                student at PUP, a freelance developer, and someone who enjoys
                turning an idea into a working web or mobile app.
              </p>
              <p className="about-bio">
                These days, I’m sharpening my craft through client work and
                personal projects. Away from the keyboard, I play guitar.
                Anointed Worship brings those two parts of my life together:
                building software that helps worship teams prepare and stay connected.
              </p>

              <div className="about-actions">
                <Link className="about-contact-link" href="/socials">
                  Say hello <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <span className="about-open-note">
                  <span aria-hidden="true" className="about-open-dot" />
                  Open to work & collaboration
                </span>
              </div>
            </div>

            <div className="about-deck-column">
              <StoryDeck />
            </div>
          </div>

          <a className="about-scroll-cue" href="#small-things">
            <span>SCROLL TO EXPLORE</span>
            <span aria-hidden="true" className="about-scroll-line" />
          </a>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="small-things" className="about-values-section" aria-labelledby="values-title">
          <div className="about-section-heading">
            <div>
              <p className="about-section-index">01 / THE SMALL THINGS</p>
              <h2 id="values-title">A few things I value</h2>
            </div>
            <p className="about-section-aside">
              How I approach the work, one project at a time.
            </p>
          </div>

          <ul className="about-values-list">
            {VALUES.map(({ number, title, description, icon: Icon }) => (
              <li key={number} className="about-value-item">
                <span className="about-value-number">{number}</span>
                <Icon className="about-value-icon" size={18} strokeWidth={1.5} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ul>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="about-timeline-section" aria-labelledby="timeline-title">
          <div className="about-section-heading about-timeline-heading">
            <div>
              <p className="about-section-index">02 / MY JOURNEY</p>
              <h2 id="timeline-title">The path so far</h2>
            </div>
            <Link href="/experience" className="about-contact-link">
              Full experience <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <ol className="about-timeline" aria-label="Projects and experience timeline">
            {MILESTONES.map((milestone) => (
              <li key={milestone.year} className="about-milestone">
                <div className="about-milestone-date">
                  <span className="about-milestone-year">{milestone.year}</span>
                  <span className="about-milestone-label">{milestone.label}</span>
                </div>
                <div className="about-milestone-copy">
                  <span className="about-milestone-marker" aria-hidden="true" />
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                  <ul className="about-tags" aria-label={`${milestone.title} themes`}>
                    {milestone.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="about-cta" aria-labelledby="about-cta-title">
          <div>
            <p className="about-section-index">LET’S BUILD SOMETHING</p>
            <h2 id="about-cta-title">Have a project in mind?</h2>
          </div>
          <Link href="/socials" className="about-cta-link">
            Let’s talk <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </ScrollReveal>
    </div>
  );
}

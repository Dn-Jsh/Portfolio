import { ArrowUpRight, Compass, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { StoryDeck } from "@/components/about/StoryDeck";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getPublicPageMetadata } from "@/lib/seo";

export const metadata = getPublicPageMetadata("/about");

const VALUES = [
  {
    number: "01",
    title: "Stay curious",
    description: "Ask one more question. Follow the interesting thread.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Make it useful",
    description: "Thoughtful details can turn a good idea into a good experience.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Share the process",
    description: "Keep learning out loud and make room for other people.",
    icon: Heart,
  },
];

const MILESTONES = [
  {
    year: "2026",
    label: "A new chapter",
    title: "Independent projects",
    description:
      "Demo milestone — exploring an idea from the first sketch through the final little details.",
    tags: ["Product thinking", "Building", "Iteration"],
  },
  {
    year: "2025",
    label: "Along the way",
    title: "Community & collaboration",
    description:
      "Sample chapter — learning alongside others, sharing useful notes, and making things together.",
    tags: ["Community", "Learning", "Sharing"],
  },
  {
    year: "2024",
    label: "The beginning",
    title: "Learning by making",
    description:
      "Sample chapter — small experiments, steady practice, and lessons from finishing projects.",
    tags: ["Curiosity", "Practice", "Projects"],
  },
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
            <span className="about-demo-tag">
              <span aria-hidden="true" className="about-demo-dot" />
              SAMPLE PROFILE
            </span>
          </div>

          <div className="about-hero-grid">
            <div className="about-copy">
              <p className="about-role">SOFTWARE DEVELOPER <span>·</span> DEMO CONTENT</p>
              <h1 id="about-title" className="about-title page-title font-bold">
                More about
                <span className="about-title-last-line">
                  me<span className="about-title-period">.</span>
                </span>
              </h1>
              <p className="about-lede">
                Hi, I’m Dan. I like making digital experiences that feel thoughtful,
                useful, and a little bit unexpected.
              </p>
              <p className="about-demo-note">
                This is placeholder copy for the page demo. Swap in your own story,
                favorite things, and photos when you’re ready.
              </p>

              <div className="about-actions">
                <Link className="about-contact-link" href="/socials">
                  Say hello <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <span className="about-open-note">
                  <span aria-hidden="true" className="about-open-dot" />
                  Open to good ideas
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
              The demo version of what guides the work, day to day.
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
              <p className="about-section-index">02 / EXPERIENCE</p>
              <h2 id="timeline-title">The path so far</h2>
            </div>
            <span className="about-sample-caption">DEMO MILESTONES</span>
          </div>

          <ol className="about-timeline" aria-label="Sample experience timeline">
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
            <p className="about-section-index">THAT’S THE DEMO</p>
            <h2 id="about-cta-title">Your story goes here.</h2>
          </div>
          <Link href="/socials" className="about-cta-link">
            Find me around <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </ScrollReveal>
    </div>
  );
}

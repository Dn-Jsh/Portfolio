"use client";

import { useState } from "react";
import { Code2, Hand, HeartHandshake, Sparkles, type LucideIcon } from "lucide-react";

const STORY_CARDS: Array<{
  id: string;
  index: string;
  title: string;
  text: string;
  word: string;
  icon: LucideIcon;
}> = [
  {
    id: "curiosity",
    index: "01",
    title: "Stay curious",
    text: "Start with a question. Keep following it.",
    word: "wonder",
    icon: Sparkles,
  },
  {
    id: "making",
    index: "02",
    title: "Make it real",
    text: "A small idea gets better once it exists.",
    word: "create",
    icon: Code2,
  },
  {
    id: "sharing",
    index: "03",
    title: "Share the good bits",
    text: "Leave a few notes for whoever comes next.",
    word: "together",
    icon: HeartHandshake,
  },
];

export function StoryDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCard = STORY_CARDS[activeIndex];
  const StoryIcon = activeCard.icon;

  function shuffleCard() {
    setActiveIndex((currentIndex) => {
      const nextOffset = 1 + Math.floor(Math.random() * (STORY_CARDS.length - 1));
      return (currentIndex + nextOffset) % STORY_CARDS.length;
    });
  }

  return (
    <div className="about-deck" role="group" aria-label="Demo story card deck">
      <div className="about-deck-stack" aria-hidden="true">
        <div className="about-deck-shadow about-deck-shadow-back" />
        <div className="about-deck-shadow about-deck-shadow-front" />
      </div>

      <article className={`about-note-card about-note-card--${activeCard.id}`}>
        <div key={activeCard.id} className="about-note-card-content">
          <div className="about-note-topline">
            <span>DN / NOTES</span>
            <span>DEMO {activeCard.index}</span>
          </div>

          <div className={`about-note-art about-note-art--${activeCard.id}`} aria-hidden="true">
            <span className="about-note-orbit about-note-orbit-one" />
            <span className="about-note-orbit about-note-orbit-two" />
            <span className="about-note-word">{activeCard.word}</span>
            <span className="about-note-icon-wrap">
              <StoryIcon size={24} strokeWidth={1.4} />
            </span>
            <span className="about-note-spark about-note-spark-one" />
            <span className="about-note-spark about-note-spark-two" />
          </div>

          <div className="about-note-copy">
            <div>
              <p className="about-note-eyebrow">A LITTLE REMINDER</p>
              <h2>{activeCard.title}</h2>
              <p>{activeCard.text}</p>
            </div>
            <span className="about-note-count">{activeCard.index} <span>/ 03</span></span>
          </div>
        </div>
        <button
          type="button"
          className="about-note-card-trigger"
          onClick={shuffleCard}
          aria-label="Show another demo story card"
        />
      </article>

      <p className="about-deck-hint">
        Tap or click the card to explore <Hand size={13} aria-hidden="true" />
      </p>
      <p className="sr-only" aria-live="polite">Showing demo note: {activeCard.title}</p>
    </div>
  );
}

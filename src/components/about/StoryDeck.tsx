"use client";

import Image from "next/image";
import { useState } from "react";
import { Hand } from "lucide-react";

const STORY_CARDS = [
  {
    id: "curiosity",
    index: "01",
    title: "Guitar in hand",
    text: "Away from the keyboard, there’s music.",
    image: "/about/guitar-performance.png",
    imageAlt: "Playing electric guitar onstage.",
  },
  {
    id: "making",
    index: "02",
    title: "Finding my own path",
    text: "Learning, freelancing, and building a future in tech.",
    image: "/about/stairway-portrait.jpg",
    imageAlt: "Looking up at the camera while standing on a staircase.",
  },
  {
    id: "sharing",
    index: "03",
    title: "Still a work in progress",
    text: "Student, developer, and always learning.",
    image: "/about/mirror-selfie.png",
    imageAlt: "Mirror selfie in a light jacket and white shirt.",
  },
] as const;

export function StoryDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCard = STORY_CARDS[activeIndex];

  function shuffleCard() {
    setActiveIndex((currentIndex) => {
      const nextOffset = 1 + Math.floor(Math.random() * (STORY_CARDS.length - 1));
      return (currentIndex + nextOffset) % STORY_CARDS.length;
    });
  }

  return (
    <div className="about-deck" role="group" aria-label="Personal photo card deck">
      <div className="about-deck-stack" aria-hidden="true">
        <div className="about-deck-shadow about-deck-shadow-back" />
        <div className="about-deck-shadow about-deck-shadow-front" />
      </div>

      <article className={`about-note-card about-note-card--${activeCard.id}`}>
        <div key={activeCard.id} className="about-note-card-content">
          <div className="about-note-topline">
            <span>DN / OFFLINE</span>
            <span>PHOTO {activeCard.index}</span>
          </div>

          <div className="about-note-art">
            <Image
              className="about-note-photo"
              src={activeCard.image}
              alt={activeCard.imageAlt}
              fill
              sizes="(max-width: 760px) calc(100vw - 3rem), 21rem"
            />
          </div>

          <div className="about-note-copy">
            <div>
              <p className="about-note-eyebrow">A LITTLE OF MY LIFE</p>
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
          aria-label="Show another photo card"
        />
      </article>

      <p className="about-deck-hint">
        Tap or click the card to explore <Hand size={13} aria-hidden="true" />
      </p>
      <p className="sr-only" aria-live="polite">Showing photo card: {activeCard.title}</p>
    </div>
  );
}

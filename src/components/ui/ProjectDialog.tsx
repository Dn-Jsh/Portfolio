"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Droplet, Music2, X } from "lucide-react";

export function ProjectDialog({ title, icon, className, children, details }: {
  title: string;
  icon?: "droplet" | "music";
  className: string;
  children: ReactNode;
  details: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const titleId = useId();
  const ProjectIcon = icon === "music" ? Music2 : Droplet;

  useEffect(() => () => {
    if (scrollIdleTimer.current !== null) clearTimeout(scrollIdleTimer.current);
  }, []);

  function showScrollbar() {
    setIsScrolling(true);
    if (scrollIdleTimer.current !== null) clearTimeout(scrollIdleTimer.current);
    scrollIdleTimer.current = setTimeout(() => setIsScrolling(false), 750);
  }

  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" aria-label={`View ${title} details`} onClick={() => dialogRef.current?.showModal()}>
        {children}
      </button>
      <dialog ref={dialogRef} className="project-dialog" aria-labelledby={titleId} onClose={() => {
        if (scrollIdleTimer.current !== null) clearTimeout(scrollIdleTimer.current);
        setIsScrolling(false);
      }} onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}>
        <div className="project-dialog-heading">
          <div className="project-dialog-identity">
            <span className="project-dialog-mark"><ProjectIcon size={24} aria-hidden="true" /></span>
            <div><p className="project-dialog-caption">Project details</p><h2 id={titleId}>{title}</h2></div>
          </div>
          <button type="button" className="project-dialog-close" aria-label={`Close ${title} details`} onClick={() => dialogRef.current?.close()}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="project-dialog-body" tabIndex={0} role="region" aria-label="Project details content" data-scrolling={isScrolling || undefined} onScroll={showScrollbar}>{details}</div>
      </dialog>
    </>
  );
}

"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useId, useRef, useState, type PointerEvent } from "react";
import type { GearItem } from "@/data/gear";

const GearModel = dynamic(() => import("./GearModel").then((module) => module.GearModel), {
  ssr: false,
  loading: () => <span className="gear-view-loading" role="status">Loading 3D preview…</span>,
});

export function GearViewer({ item, featured = false }: { item: GearItem; featured?: boolean }) {
  const [mode, setMode] = useState<"image" | "model">("image");
  const photoRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const reference = item.referenceImage ?? item.image;

  const tilt = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--photo-x", `${-y * 5}deg`);
    event.currentTarget.style.setProperty("--photo-y", `${x * 7}deg`);
  };

  const resetTilt = () => {
    photoRef.current?.style.setProperty("--photo-x", "0deg");
    photoRef.current?.style.setProperty("--photo-y", "0deg");
  };

  return (
    <div className="gear-viewer">
      <div className="gear-view-surface">
        {mode === "image" ? (
          <>
            <button
              ref={photoRef}
              type="button"
              className="gear-photo"
              onPointerMove={tilt}
              onPointerLeave={resetTilt}
              onClick={() => dialogRef.current?.showModal()}
              aria-label={`Enlarge ${item.name}${item.referenceImage ? " original reference" : " product image"}`}
            >
              <span className="gear-photo-float">
                <span className="gear-photo-tilt">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes={featured ? "(max-width: 700px) 90vw, 50vw" : "(max-width: 560px) 90vw, 35vw"}
                    loading={featured ? "eager" : "lazy"}
                    unoptimized
                    className="object-contain"
                  />
                </span>
              </span>
            </button>
          </>
        ) : (
          <>
            <span className="gear-model-notice">Approximate 3D model</span>
            <GearModel kind={item.model} name={item.name} fallbackImage={item.image} />
          </>
        )}
      </div>
      <div className="gear-view-toolbar">
        <div className="gear-view-switch" role="group" aria-label={`View options for ${item.name}`}>
          <button type="button" aria-pressed={mode === "image"} onClick={() => setMode("image")}>Product image</button>
          <button type="button" aria-pressed={mode === "model"} onClick={() => setMode("model")}>3D preview</button>
        </div>
      </div>

      <dialog ref={dialogRef} className="gear-lightbox" aria-labelledby={titleId}
        onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        <div className="gear-lightbox-content">
          <header className="gear-lightbox-header">
            <div>
              <p>{item.referenceImage ? "Original reference · unedited" : "Representative product image"}</p>
              <h2 id={titleId}>{item.name}</h2>
            </div>
            <button type="button" className="gear-lightbox-close" onClick={() => dialogRef.current?.close()} aria-label="Close enlarged image">×</button>
          </header>
          <div className="gear-lightbox-image">
            <Image src={reference} alt={item.referenceImage ? `Original reference image supplied for ${item.name}` : item.imageAlt}
              fill sizes="90vw" unoptimized className="object-contain" />
          </div>
          <footer>
            <span>{item.referenceImage ? "Original colors and details, including the source background." : "Representative cutout; exact chassis details may differ."}</span>
            <a href={reference} target="_blank" rel="noopener noreferrer">Open full size ↗</a>
          </footer>
        </div>
      </dialog>
    </div>
  );
}

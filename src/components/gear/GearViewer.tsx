"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { GearItem } from "@/data/gear";

const GearModel = dynamic(() => import("./GearModel").then((module) => module.GearModel), {
  ssr: false,
  loading: () => <span className="gear-view-loading" role="status">Loading 3D preview…</span>,
});

export function GearViewer({ item, featured = false }: { item: GearItem; featured?: boolean }) {
  const [mode, setMode] = useState<"image" | "model">("image");
  const photoRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const photo = photoRef.current;
      if (!photo) return;
      const bounds = photo.getBoundingClientRect();
      const x = (pointerRef.current.x - bounds.left) / bounds.width - 0.5;
      const y = (pointerRef.current.y - bounds.top) / bounds.height - 0.5;
      photo.style.setProperty("--photo-x", `${-y * 5}deg`);
      photo.style.setProperty("--photo-y", `${x * 7}deg`);
    });
  };

  const resetTilt = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    photoRef.current?.style.setProperty("--photo-x", "0deg");
    photoRef.current?.style.setProperty("--photo-y", "0deg");
  };

  return (
    <div className="gear-viewer">
      <div className="gear-view-surface">
        {mode === "image" ? (
          <div ref={photoRef} className="gear-photo" onPointerMove={tilt} onPointerLeave={resetTilt}>
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
          </div>
        ) : (
          <>
            <div className="gear-model-pending" aria-hidden="true">
              <Image
                src={item.image}
                alt=""
                fill
                sizes={featured ? "(max-width: 700px) 90vw, 50vw" : "(max-width: 560px) 90vw, 35vw"}
                unoptimized
                className="object-contain"
              />
            </div>
            <span className="gear-model-notice">Custom 3D model · hidden details estimated</span>
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

    </div>
  );
}

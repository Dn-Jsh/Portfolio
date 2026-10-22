import Image from "next/image";
import type { GearItem } from "@/data/gear";

export function GearViewer({ item, featured = false }: { item: GearItem; featured?: boolean }) {
  return (
    <div className="gear-viewer">
      <div className="gear-view-surface">
        <div className="gear-photo">
          <span className="gear-photo-float">
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes={featured ? "(max-width: 700px) 90vw, 600px" : "(max-width: 560px) 90vw, 384px"}
              loading={featured ? "eager" : "lazy"}
              unoptimized={!item.image.startsWith("/") || item.image.startsWith("//")}
              className="object-contain"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

import type { GearModelKind } from "@/data/gear";

const MODEL_ASSETS: Record<GearModelKind, string> = {
  laptop: "/gear/models/rog-strix-g713qe.glb",
  keyboard: "/gear/models/aula-f75.glb",
  mouse: "/gear/models/attack-shark-x11.glb",
  earbuds: "/gear/models/soundcore-r50i.glb",
  phone: "/gear/models/galaxy-z-fold5.glb",
};

export function getGearModelAsset(kind: GearModelKind) {
  return MODEL_ASSETS[kind];
}

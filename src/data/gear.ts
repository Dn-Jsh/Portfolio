export type GearModelKind = "laptop" | "keyboard" | "mouse" | "earbuds" | "phone";

export type GearItem = {
  name: string;
  description: string;
  category: "DESK SETUP" | "EVERYDAY CARRY";
  model: GearModelKind;
  image: string;
  imageAlt: string;
  referenceImage?: string;
};

export const GEAR: GearItem[] = [
  {
    name: "ASUS ROG Strix G17 (G713QE)",
    description: "Ryzen 9 5900HX · RTX 3050 Ti 4GB · 16GB RAM · 512GB SSD.",
    category: "DESK SETUP",
    model: "laptop",
    image: "/gear/rog-strix-g713qe.png",
    imageAlt: "Representative cutout of a black ROG Strix G17 gaming laptop.",
  },
  {
    name: "AULA F75",
    description: "75% mechanical keyboard.",
    category: "DESK SETUP",
    model: "keyboard",
    image: "/gear/aula-f75.png",
    referenceImage: "/gear/references/aula-f75.png",
    imageAlt: "Enhanced cutout of a white and blue AULA F75 mechanical keyboard.",
  },
  {
    name: "Attack Shark X11",
    description: "Wireless gaming mouse.",
    category: "DESK SETUP",
    model: "mouse",
    image: "/gear/attack-shark-x11.png",
    referenceImage: "/gear/references/attack-shark-x11.png",
    imageAlt: "Enhanced cutout of an Attack Shark X11 mouse with charging dock.",
  },
  {
    name: "Soundcore R50i",
    description: "Wireless earbuds with charging case.",
    category: "EVERYDAY CARRY",
    model: "earbuds",
    image: "/gear/soundcore-r50i.png",
    referenceImage: "/gear/references/soundcore-r50i.png",
    imageAlt: "Enhanced cutout of black Soundcore R50i earbuds with charging case.",
  },
  {
    name: "Samsung Galaxy Z Fold5",
    description: "Foldable smartphone.",
    category: "EVERYDAY CARRY",
    model: "phone",
    image: "/gear/galaxy-z-fold5.png",
    referenceImage: "/gear/references/galaxy-z-fold5.png",
    imageAlt: "Enhanced cutout of Icy Blue Samsung Galaxy Z Fold5 front and rear product views.",
  },
];

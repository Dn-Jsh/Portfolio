import {
  Newspaper,
  Monitor,
  Share2,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

export type NavGroup = {
  links: NavLink[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    links: [
      { href: "/blog", label: "Blog", icon: Newspaper },
      { href: "/gear", label: "Gear", icon: Monitor },
      { href: "/socials", label: "Socials", icon: Share2 },
    ],
  },
  {
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/experience", label: "Experience" },
      { href: "/stack", label: "Stack" },
      { href: "/certifications", label: "Certifications" },
      { href: "/recommendations", label: "Recommendations" },
    ],
  },
];

import type { Metadata } from "next";

export const SITE_URL = "https://dnjsh.site";
export const SITE_HANDLE = "dnjsh";
export const FULL_NAME = "Dan Jeshua D. Fiscal";
export const HOME_TITLE = "dnjsh | Dan Jeshua — Full-stack Developer";
export const HOME_DESCRIPTION =
  "Dan Jeshua, also known as dnjsh, is a developer building web and mobile apps. Explore his projects, experience, and certifications.";

export const PUBLIC_PAGES = {
  "/": { title: HOME_TITLE, description: HOME_DESCRIPTION },
  "/blog": {
    title: "Blog",
    description: "Thoughts, tutorials, and notes from Dan Jeshua (dnjsh) on software development and building web and mobile apps.",
  },
  "/projects": {
    title: "Projects",
    description: "Explore web apps, mobile apps, and developer tools built by Dan Jeshua, also known as dnjsh.",
  },
  "/experience": {
    title: "Experience",
    description: "Explore Dan Jeshua's (dnjsh) experience in web and mobile development, freelance projects, and team collaborations.",
  },
  "/stack": {
    title: "Tech Stack",
    description: "The languages, frameworks, databases, and tools Dan Jeshua (dnjsh) uses to build web and mobile apps.",
  },
  "/certifications": {
    title: "Certifications",
    description: "Explore Dan Jeshua's (dnjsh) certifications and credentials in technology, networking, and software development.",
  },
  "/recommendations": {
    title: "Recommendations",
    description: "Read what teammates, leaders, and mentors say about working with Dan Jeshua, also known as dnjsh.",
  },
  "/gear": {
    title: "Gear",
    description: "Explore the devices and everyday setup Dan Jeshua (dnjsh) uses for development, work, and daily life.",
  },
  "/socials": {
    title: "Socials",
    description: "Find Dan Jeshua (dnjsh) on GitHub, LinkedIn, and other social platforms through his official portfolio links.",
  },
} as const;

export function createPageMetadata(
  pathname: string,
  title: string,
  description: string,
): Metadata {
  const pageTitle = pathname === "/" ? title : `${title} | dnjsh — Dan Jeshua`;
  const url = new URL(pathname, SITE_URL).href;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_HANDLE,
      title: pageTitle,
      description,
      url,
    },
    twitter: { card: "summary", title: pageTitle, description },
  };
}

export function getPublicPageMetadata(pathname: keyof typeof PUBLIC_PAGES): Metadata {
  const page = PUBLIC_PAGES[pathname];
  return createPageMetadata(pathname, page.title, page.description);
}

export function createProfileStructuredData(displayName: string, socialLinks: string[]) {
  const sameAs = socialLinks.flatMap((link) => {
    try {
      const url = new URL(link);
      if (url.protocol !== "https:" && url.protocol !== "http:") return [];
      url.search = "";
      url.hash = "";
      return [url.href];
    } catch {
      return [];
    }
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_HANDLE,
        alternateName: `${displayName} Portfolio`,
        url: `${SITE_URL}/`,
        description: HOME_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: FULL_NAME,
        alternateName: [displayName, SITE_HANDLE],
        url: `${SITE_URL}/`,
        sameAs: [...new Set(sameAs)],
      },
    ],
  };
}

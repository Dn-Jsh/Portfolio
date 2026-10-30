export type Project = {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  status: string;
  icon?: "droplet" | "music";
  image?: { src: string; alt: string; width: number; height: number };
  details?: {
    overview: string;
    features: string[];
    roles: { title: string; description: string }[];
    technologies: { title: string; description: string }[];
    workflow: string[];
    workflowTitle?: string;
    architecture: string;
    note: string;
  };
};

export const RED_CROSS_PROJECT: Project = {
  id: "red-cross-blood-bank-portal",
  title: "Red Cross Blood Bank Portal",
  description: "A web platform for the Santa Rosa branch that connects donor screening, donation scheduling, blood requests, donor matching, and inventory management.",
  tags: ["Laravel", "Blade", "Tailwind CSS", "JavaScript", "Supabase", "PostgreSQL"],
  link: "#",
  status: "Web Application",
  image: {
    src: "/projects/red-cross-blood-bank.png",
    alt: "Red Cross Blood Bank Portal homepage with donation services and registration",
    width: 1890,
    height: 986,
  },
  details: {
    overview: "Built to support blood donation and blood bank operations in one place. Donors can access services online, while staff review requests, record collections, monitor stock, and manage records from a central workspace.",
    features: [
      "Email/password accounts, donor Google sign-in, password recovery, and staff multi-factor authentication.",
      "Consent and preliminary health screening, donation-center selection, appointment booking, and staff capacity management.",
      "Blood requests with patient and hospital details, urgency, components, quantities, and private supporting documents.",
      "Consent-aware donor matching, invitations, accept/decline responses, and handover tickets.",
      "Individual blood-unit tracking, expiry dates, quarantine, stock reservations, verification, and release.",
      "Completed collection records and donation history, maps and directions, and in-app notifications.",
      "Donation campaigns, analytics, filtered PDF reports, and configurable email/SMS notifications.",
      "Staff permissions, audit logs, Trash and restoration, privacy requests, and configured backup tools.",
    ],
    roles: [
      { title: "Donor", description: "Register, complete screening, schedule donations, submit requests, view history, and respond to match invitations." },
      { title: "Admin", description: "Review screenings and bookings, manage donors and blood requests, record collections, and manage inventory within assigned permissions." },
      { title: "Super Admin", description: "Oversee operations, manage staff and permissions, inspect logs, restore deleted records, and manage configured backups." },
    ],
    technologies: [
      { title: "Backend", description: "PHP and Laravel handle routes, validation, middleware, services, and application logic." },
      { title: "Interface", description: "Blade and HTML render server pages; Tailwind CSS, custom CSS, JavaScript, and Hotwire Turbo provide responsive styling and interactions." },
      { title: "Data and access", description: "Supabase PostgreSQL, REST API, and database functions manage records and transactions. Supabase Auth, Laravel middleware, and row-level security protect access; Supabase Storage holds private files." },
      { title: "Maps and design", description: "Mapbox GL JS, Leaflet with OpenStreetMap fallback, Lucide icons, and Plus Jakarta Sans fonts." },
      { title: "Reports and messaging", description: "Laravel DomPDF generates reports. Configurable transports include Gmail API/OAuth, Brevo, Resend, SMTP, PhilSMS, and Infobip." },
      { title: "Build and deployment", description: "Vite, Node.js, npm, and Composer build assets and dependencies. Render uses Docker, Apache, and PHP, with file sessions/cache and synchronous Laravel queues." },
      { title: "Quality and source control", description: "PHPUnit, Playwright, JavaScript and SQL tests, Laravel Pint, Git, and GitHub." },
    ],
    workflow: ["Registration", "Screening", "Appointment booking", "Staff review", "Actual collection", "Stock verification and release"],
    architecture: "The browser receives server-rendered Blade pages enhanced with JavaScript. Laravel communicates with Supabase for authentication, business records, database operations, and private documents.",
    note: "Based on project source. Live email, SMS, Google sign-in, maps, and backups depend on configuration. Blood requests follow a separate staff review and stock-allocation or donor-invitation process. Screening and matching support staff decisions; qualified personnel retain clinical clearance.",
  },
};

export const SUNDAY_SETLIST_PROJECT: Project = {
  id: "1",
  title: "Sunday Setlist",
  description: "A worship ministry workspace for service setlists, chord charts, rehearsals, team schedules, and communication.",
  tags: ["Next.js", "React", "TypeScript", "Supabase", "Tailwind CSS", "Vercel"],
  link: "https://anointed-worship-app.vercel.app/",
  status: "Web Application",
  icon: "music",
  image: {
    src: "/projects/sunday-setlist.png",
    alt: "Sunday Setlist homepage showing ministry planning, a service setlist, and team tools",
    width: 1850,
    height: 1024,
  },
  details: {
    overview: "Previously named Anointed Worship, Sunday Setlist helps worship leaders, musicians, dancers, media teams, and ministry administrators prepare together before and during services.",
    features: [
      "Create service setlists, reorder songs, add band notes, and reuse saved templates.",
      "Search a shared song library with lyrics, chord charts, keys, tempos, artists, favorites, and reference media.",
      "Practice with chord transposition, capo settings, auto-scroll, a metronome, arrangement loops, and performance-focused stage charts.",
      "Schedule services and rehearsals, assign members, collect availability responses, and connect events to setlists.",
      "Create or join a team, review membership requests, and manage members and role permissions.",
      "Coordinate through conversations, replies, reactions, attachments, announcements, reminders, and supported push notifications.",
      "Prepare choreography charts, formation and outfit notes, and reference videos for dance ministry.",
      "Use projector and confidence displays, and pair a phone with a compatible Windows Presenter session through QR or PIN.",
      "Review song usage, availability responses, and channel activity; find prepared answers and walkthroughs through Wooly help.",
      "Access the responsive website on phones and tablets, or install it as a Progressive Web App.",
    ],
    roles: [
      { title: "Worship leaders", description: "Prepare service plans, organize songs and rehearsals, and coordinate team schedules and availability." },
      { title: "Musicians and dancers", description: "Use chord charts, practice tools, choreography references, and shared notes to prepare for services." },
      { title: "Media and ministry teams", description: "Coordinate displays, team communication, membership, permissions, and service preparation." },
    ],
    technologies: [
      { title: "Application and interface", description: "Next.js App Router, React, TypeScript, and Node.js power pages, server rendering, Server Actions, and API routes. Tailwind CSS, clsx, tailwind-merge, and Lucide shape the interface; dnd-kit and TanStack Virtual support ordering and long lists." },
      { title: "Data and access", description: "Supabase PostgreSQL, SQL migrations, and generated types manage records. Supabase Auth supports Google sign-in and cookie sessions; approved team membership, application permissions, and Row Level Security govern access. Storage and Realtime support files, messages, and presence." },
      { title: "Validation and rate limits", description: "Zod validates structured input. Upstash Redis and Upstash Ratelimit support request limits." },
      { title: "Music and supporting tools", description: "Spotify API, YouTube/Spotify embeds, Pitchy, and PDF.js support music references, pitch detection, and document viewing. Utilities include date-fns, Cheerio, JSZip, qrcode, ZXing, and canvas tooling." },
      { title: "Mobile and notifications", description: "A PWA manifest, service worker, and public-asset caching support installation. Web Push and VAPID support notifications; website offline support is limited." },
      { title: "Hosting and automation", description: "Vercel hosts the application and scheduled API jobs. Release tooling uses Node.js 22, with GitHub Actions for automated checks." },
      { title: "Testing and quality", description: "Vitest, React Testing Library, Playwright, ESLint, and TypeScript checks support application quality." },
    ],
    workflowTitle: "Service preparation",
    workflow: ["Create or join a team", "Build the song library", "Prepare a setlist", "Schedule the team", "Rehearse together", "Lead the service"],
    architecture: "Next.js provides both the React website and server-side application backend. Supabase handles authentication, PostgreSQL records, private files, and live updates, with deployment and scheduled jobs configured on Vercel.",
    note: "Feature summary is based on project files; live workflows have not been verified. The full Presenter workspace and Sync Center downloads run in the separate Windows app, with website users directed to Worship Remote for Presenter access. Website offline support is limited. Message forwarding/pinning and some setup/profile preferences remain unfinished.",
  },
};

export const PROJECTS: Project[] = [
  RED_CROSS_PROJECT,
  SUNDAY_SETLIST_PROJECT,
  {
    id: "2",
    title: "TaskFlow",
    description: "A minimalist project management tool with drag-and-drop kanban boards, time tracking, and team collaboration features.",
    tags: ["Next.js", "Prisma", "PostgreSQL"],
    link: "#",
    status: "In Development",
  },
  {
    id: "3",
    title: "QuickBite",
    description: "A food ordering platform for local restaurants with real-time order tracking, payment integration, and restaurant dashboard.",
    tags: ["React", "Node.js", "MongoDB"],
    link: "#",
    status: "Released",
  },
  {
    id: "4",
    title: "DevNotes",
    description: "A markdown-based note-taking app designed for developers with code snippet support, syntax highlighting, and cloud sync.",
    tags: ["Electron", "React", "SQLite"],
    link: "#",
    status: "Side Project",
  },
];

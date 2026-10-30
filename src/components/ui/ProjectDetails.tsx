import { CalendarDays, ChartNoAxesCombined, Droplets, FileText, Footprints, Guitar, Layers3, Library, ListMusic, LogIn, MapPin, MessageSquare, MonitorPlay, Route, Shield, ShieldCheck, Smartphone, UserRoundSearch, Users } from "lucide-react";
import type { Project } from "@/data/projects";
import Image from "next/image";

const FEATURE_ICONS = [LogIn, CalendarDays, FileText, UserRoundSearch, Droplets, MapPin, ChartNoAxesCombined, Shield];
const WORSHIP_FEATURE_ICONS = [ListMusic, Library, Guitar, CalendarDays, Users, MessageSquare, Footprints, MonitorPlay, ChartNoAxesCombined, Smartphone];

export function ProjectDetails({ project, details }: { project: Project; details: NonNullable<Project["details"]> }) {
  const featureIcons = project.icon === "music" ? WORSHIP_FEATURE_ICONS : FEATURE_ICONS;
  const projectUrl = /^https?:\/\//i.test(project.link) ? project.link : undefined;
  const preview = project.image && <Image src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} sizes="(max-width: 900px) calc(100vw - 4rem), 480px" />;
  return (
    <>
      <div className={`project-overview${project.image ? " project-overview-with-image" : ""}`}>
        <div className="project-hero-copy">
          {project.status && <span className="project-kind"><span aria-hidden="true" />{project.status}</span>}
          <p className="project-summary">{project.description}</p>
          <div className="project-technologies" aria-label="Main technologies">{project.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <p className="project-introduction">{details.overview}</p>
        </div>
        {project.image && <figure className="project-preview">
          {projectUrl ? <a href={projectUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.title} website (opens in a new tab)`}>{preview}</a> : preview}
          {projectUrl && <figcaption><a href={projectUrl} target="_blank" rel="noopener noreferrer">Visit project<span className="sr-only"> (opens in a new tab)</span></a></figcaption>}
        </figure>}
      </div>

      <section className="project-section">
        <h3><Layers3 size={19} aria-hidden="true" />Key features</h3>
        <ul className="project-features">
          {details.features.map((feature, index) => {
            const FeatureIcon = featureIcons[index] ?? Layers3;
            return <li key={feature}><FeatureIcon size={19} aria-hidden="true" /><span>{feature}</span></li>;
          })}
        </ul>
      </section>

      <section className="project-section">
        <h3><Users size={19} aria-hidden="true" />Who it serves</h3>
        <dl className="project-roles">
          {details.roles.map((role) => <div key={role.title}><dt>{role.title}</dt><dd>{role.description}</dd></div>)}
        </dl>
      </section>

      <section className="project-section project-workflow-section">
        <h3><Route size={19} aria-hidden="true" />{details.workflowTitle ?? "Donation workflow"}</h3>
        <ol className="project-workflow">
          {details.workflow.map((step, index) => <li key={step}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}
        </ol>
      </section>

      <section className="project-section">
        <h3><Layers3 size={19} aria-hidden="true" />Technology stack</h3>
        <dl className="project-stack">
          {details.technologies.map((technology) => <div key={technology.title}><dt>{technology.title}</dt><dd>{technology.description}</dd></div>)}
        </dl>
      </section>

      <section className="project-architecture">
        <h3><ShieldCheck size={19} aria-hidden="true" />Architecture</h3>
        <p>{details.architecture}</p>
      </section>

      <footer className="project-dialog-footer">
        <p>{details.note}</p>
      </footer>
    </>
  );
}

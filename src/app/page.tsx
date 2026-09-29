import { Hero } from "@/components/home/Hero";
import { RecentPosts } from "@/components/home/RecentPosts";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { ExperiencePreview } from "@/components/home/ExperiencePreview";
import { CertificationsPreview } from "@/components/home/CertificationsPreview";
import { RecommendationsPreview } from "@/components/home/RecommendationsPreview";
import { GitHubPreview } from "@/components/home/GitHubPreview";

export default function Home() {
  return (
    <div className="animate-in fade-in duration-500">
      <Hero />
      <RecentPosts />
      <ProjectsPreview />
      <ExperiencePreview />
      <CertificationsPreview />
      <RecommendationsPreview />
      <GitHubPreview />
    </div>
  );
}

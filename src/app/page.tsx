import { Hero } from "@/components/home/Hero";
import { RecentPosts } from "@/components/home/RecentPosts";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { ExperiencePreview } from "@/components/home/ExperiencePreview";
import { CertificationsPreview } from "@/components/home/CertificationsPreview";
import { RecommendationsPreview } from "@/components/home/RecommendationsPreview";
import { GitHubPreview } from "@/components/home/GitHubPreview";
import { AuthEmailLanding } from "@/components/admin/AuthEmailLanding";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="page-enter">
      <AuthEmailLanding />
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

import { getSortedContentData } from '@/lib/content';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/lib/types';

export const metadata = {
  title: 'Projects - Walden WPC',
  description: 'A showcase of my projects and work.',
};

export default function ProjectsPage() {
  const projects = getSortedContentData('projects');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary-text mb-4">My <span>Projects</span></h1>
        <p className="text-xl text-secondary-text">Here are some of the projects I&apos;ve worked on.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project: Project) => (
          <ProjectCard
            key={project.slug}
            slug={project.slug}
            title={project.title}
            summary={project.summary}
            image={project.image}
            tags={project.tags}
          />
        ))}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { getSortedContentData } from '@/lib/content';
import ProjectCard from '@/components/ProjectCard';
import WritingCard from '@/components/WritingCard';
import { Project, Writing } from '@/lib/types';

export default function Home() {
  const latestProjects = getSortedContentData('projects').slice(0, 3);
  const latestWritings = getSortedContentData('writings').slice(0, 3);

  return (
    <>
      <section className="relative py-32 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
              <rect width="1600" height="900" fill="var(--background-color)"/>
              <g opacity="0.2">
                  <circle cx="250" cy="350" r="300" fill="var(--accent-color)"/>
                  <circle cx="1350" cy="500" r="350" fill="none" stroke="var(--accent-color)" strokeWidth="40"/>
              </g>
          </svg>
        </div>
        <div className="relative z-10 container mx-auto px-8">
          <h1 className="text-7xl font-extrabold tracking-tighter text-text-primary">
            Developer & <span className="text-accent">Creator</span>
          </h1>
          <p className="text-xl text-text-secondary mt-4">
            Crafting digital experiences with code and creativity.
          </p>
        </div>
      </section>

      <section id="projects" className="py-16">
          <div className="container mx-auto px-8">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold border-b-2 border-accent inline-block pb-2">Featured Projects</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestProjects.map((project: Project) => (
                  <ProjectCard
                    key={project.slug}
                    slug={project.slug}
                    title={project.title}
                    date={project.date}
                    summary={project.summary}
                    image={project.image}
                    tags={project.tags}
                  />
                ))}
              </div>
          </div>
      </section>

      <section id="writings" className="py-16">
          <div className="container mx-auto px-8">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold border-b-2 border-accent inline-block pb-2">Latest Writings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestWritings.map((writing: Writing) => (
                  <WritingCard
                    key={writing.slug}
                    slug={writing.slug}
                    title={writing.title}
                    date={writing.date}
                    summary={writing.summary}
                    tags={writing.tags}
                  />
                ))}
              </div>
          </div>
      </section>
    </>
  );
}
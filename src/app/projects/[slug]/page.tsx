import { getAllContentSlugs, getContentBySlug } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { ProjectFrontmatter } from '@/lib/types';

export async function generateStaticParams() {
  const slugs = getAllContentSlugs('projects');
  return slugs.map(slug => ({ slug: slug.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { frontmatter } = await getContentBySlug(params.slug, 'projects');
  return {
    title: `${(frontmatter as ProjectFrontmatter).title} - Walden WPC`,
    description: (frontmatter as ProjectFrontmatter).summary,
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const { frontmatter, content } = await getContentBySlug(params.slug, 'projects');
  const projectFrontmatter = frontmatter as ProjectFrontmatter;

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary-text mb-4">{projectFrontmatter.title}</h1>
        <p className="text-lg text-secondary-text mb-4">{projectFrontmatter.summary}</p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
            {projectFrontmatter.tags.map((tag: string) => (
              <span key={tag} className="bg-surface text-secondary-text px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
        </div>
        {projectFrontmatter.image && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mx-auto mt-6">
            <Image src={projectFrontmatter.image} alt={projectFrontmatter.title} fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="prose dark:prose-invert max-w-none text-primary-text">
        <MDXRemote source={content} />
      </div>

      <div className="mt-12 pt-8 border-t border-surface flex flex-wrap justify-center gap-4">
        {projectFrontmatter.githubUrl && (
            <Link href={projectFrontmatter.githubUrl} target="_blank" rel="noopener noreferrer" className="bg-accent text-background px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity duration-300">
                View on GitHub
            </Link>
        )}
        {projectFrontmatter.liveUrl && (
            <Link href={projectFrontmatter.liveUrl} target="_blank" rel="noopener noreferrer" className="bg-surface text-primary-text border border-secondary-text px-6 py-3 rounded-full font-semibold hover:border-accent transition-colors duration-300">
                View Live Site
            </Link>
        )}
      </div>
    </article>
  );
}

import { getAllContentSlugs, getContentBySlug } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { WritingFrontmatter } from '@/lib/types';

export async function generateStaticParams() {
  const slugs = getAllContentSlugs('writings');
  return slugs.map(slug => ({ slug: slug.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { frontmatter } = await getContentBySlug(params.slug, 'writings');
  return {
    title: `${(frontmatter as WritingFrontmatter).title} - Walden WPC`,
    description: (frontmatter as WritingFrontmatter).summary,
  };
}

export default async function WritingDetailPage({ params }: { params: { slug: string } }) {
  const { frontmatter, content } = await getContentBySlug(params.slug, 'writings');
  const writingFrontmatter = frontmatter as WritingFrontmatter;

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary-text mb-4">{writingFrontmatter.title}</h1>
        <time dateTime={writingFrontmatter.date} className="text-lg text-secondary-text">
          {new Date(writingFrontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </time>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
            {writingFrontmatter.tags.map((tag: string) => (
              <span key={tag} className="bg-surface text-secondary-text px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none text-primary-text">
        <MDXRemote source={content} />
      </div>
    </article>
  );
}

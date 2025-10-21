import { getSinglePageContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';

export async function generateMetadata() {
  const { frontmatter } = await getSinglePageContent('about');
  return {
    title: `${frontmatter.title} - Walden WPC`,
  };
}

export default async function AboutPage() {
  const { frontmatter, content } = await getSinglePageContent('about');

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary-text mb-4">{frontmatter.title}</h1>
      </div>

      <div className="prose dark:prose-invert max-w-none text-primary-text">
        <MDXRemote source={content} />
      </div>
    </article>
  );
}

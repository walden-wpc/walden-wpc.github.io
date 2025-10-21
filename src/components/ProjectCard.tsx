import Image from 'next/image';
import Link from 'next/link';
import { Project } from '@/lib/types';

export default function ProjectCard({ slug, title, date, summary, image, tags }: Project) {
  return (
    <Link href={`/projects/${slug}`} className="block group">
      <div className="bg-surface rounded-lg p-6 border border-surface transition-all duration-300 group-hover:border-accent h-full flex flex-col">
        <div className="relative aspect-video rounded-md overflow-hidden mb-4">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3 className="text-2xl font-semibold text-primary-text mb-2 transition-colors duration-300 group-hover:text-accent">{title}</h3>
        <p className="text-sm text-secondary-text mb-2">{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="text-secondary-text text-base flex-grow">{summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="bg-background text-secondary-text px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

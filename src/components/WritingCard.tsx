import Link from 'next/link';
import { Writing } from '@/lib/types';

export default function WritingCard({ slug, title, summary, date, tags }: Writing) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/writings/${slug}`} className="block group">
      <article className="bg-surface rounded-lg p-6 border border-surface transition-all duration-300 group-hover:border-accent h-full flex flex-col">
        <div className="flex justify-between items-center mb-2 text-secondary-text text-sm">
          <time dateTime={date}>{formattedDate}</time>
        </div>
        <h3 className="text-2xl font-semibold text-primary-text mb-2 transition-colors duration-300 group-hover:text-accent flex-grow">{title}</h3>
        <p className="text-secondary-text text-base">{summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="bg-background text-secondary-text px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
}

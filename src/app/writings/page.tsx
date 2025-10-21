import { getSortedContentData } from '@/lib/content';
import WritingCard from '@/components/WritingCard';
import { Writing } from '@/lib/types';

export const metadata = {
  title: 'Writings - Walden WPC',
  description: 'A collection of my articles and thoughts.',
};

export default function WritingsPage() {
  const writings = getSortedContentData('writings');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary-text mb-4">My <span>Writings</span></h1>
        <p className="text-xl text-secondary-text">Here I share my thoughts, tutorials, and journey in the world of technology.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {writings.map((writing: Writing) => (
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
  );
}

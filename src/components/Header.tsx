import Link from 'next/link';

export default function Header() {
  return (
    <header className="py-6 border-b border-surface">
      <div className="container flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-text">
          Walden<span className="text-accent">.</span>WPC
        </Link>
        <nav className="space-x-8">
          <Link href="/projects" className="text-secondary-text hover:text-primary-text transition-colors duration-300">
            Projects
          </Link>
          <Link href="/writings" className="text-secondary-text hover:text-primary-text transition-colors duration-300">
            Writings
          </Link>
          <Link href="/about" className="text-secondary-text hover:text-primary-text transition-colors duration-300">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

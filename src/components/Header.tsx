import Link from 'next/link';

export default function Header() {
  return (
    <header className="py-6 border-b border-surface">
      <div className="container mx-auto px-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Walden<span className="text-accent">.</span>WPC
        </Link>
        <nav>
          <Link href="/projects" className="text-text-secondary hover:text-text-primary transition-colors duration-300 ml-8 font-medium">
            Projects
          </Link>
          <Link href="/writings" className="text-text-secondary hover:text-text-primary transition-colors duration-300 ml-8 font-medium">
            Writings
          </Link>
          <Link href="#" className="text-text-secondary hover:text-text-primary transition-colors duration-300 ml-8 font-medium">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

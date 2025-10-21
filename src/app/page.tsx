import Link from 'next/link';

export default function Home() {
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
                  <Link href="/projects/personal-website" className="block group">
                      <div className="bg-surface rounded-xl p-8 border border-surface group-hover:border-accent group-hover:-translate-y-1 transition-all duration-300 h-full">
                          <h3 className="text-2xl font-semibold mb-6 text-text-primary group-hover:text-accent transition-colors duration-300">Personal Website</h3>
                          <p className="text-text-secondary leading-relaxed">The very site you are on. Built with Next.js and a passion for clean design.</p>
                      </div>
                  </Link>
                  <Link href="/projects/data-visualizer" className="block group">
                      <div className="bg-surface rounded-xl p-8 border border-surface group-hover:border-accent group-hover:-translate-y-1 transition-all duration-300 h-full">
                          <h3 className="text-2xl font-semibold mb-6 text-text-primary group-hover:text-accent transition-colors duration-300">Data Visualizer</h3>
                          <p className="text-text-secondary leading-relaxed">An interactive tool to visualize complex data sets using D3.js and React.</p>
                      </div>
                  </Link>
                  {/* Add more project cards as needed */}
              </div>
          </div>
      </section>

      <section id="writings" className="py-16">
          <div className="container mx-auto px-8">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold border-b-2 border-accent inline-block pb-2">Latest Writings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Link href="/writings/deep-dive-css" className="block group">
                      <div className="bg-surface rounded-xl p-8 border border-surface group-hover:border-accent group-hover:-translate-y-1 transition-all duration-300 h-full">
                          <h3 className="text-2xl font-semibold mb-6 text-text-primary group-hover:text-accent transition-colors duration-300">Deep Dive into Modern CSS</h3>
                          <p className="text-text-secondary leading-relaxed">Exploring the power of Grid, Flexbox, and Custom Properties.</p>
                      </div>
                  </Link>
                  <Link href="/writings/hello-world" className="block group">
                      <div className="bg-surface rounded-xl p-8 border border-surface group-hover:border-accent group-hover:-translate-y-1 transition-all duration-300 h-full">
                          <h3 className="text-2xl font-semibold mb-6 text-text-primary group-hover:text-accent transition-colors duration-300">Hello World: A New Journey</h3>
                          <p className="text-text-secondary leading-relaxed">The obligatory first post documenting the start of a new digital space.</p>
                      </div>
                  </Link>
              </div>
          </div>
      </section>
    </>
  );
}

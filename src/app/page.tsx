import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="relative py-32 text-center overflow-hidden">
        <div className="absolute inset-0 z-10 pointer-events-none">
          <svg style="width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
              <rect width="1600" height="900" fill="var(--background-color)"/>
              <g opacity="0.2">
                  <circle cx="250" cy="350" r="300" fill="var(--accent-color)"/>
                  <circle cx="1350" cy="500" r="350" fill="none" stroke="var(--accent-color)" stroke-width="40"/>
              </g>
          </svg>
        </div>
        <div className="relative z-20 container mx-auto px-4">
          <h1 className="text-6xl font-extrabold tracking-tight text-primary-text mb-4">
            Developer & <span>Creator</span>
          </h1>
          <p className="text-xl text-secondary-text">
            Crafting digital experiences with code and creativity.
          </p>
        </div>
      </section>

      <section id="projects" className="py-16">
          <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold border-b-2 border-accent inline-block pb-2">Featured Projects</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Placeholder for Project Cards */}
                  <div className="bg-surface rounded-lg p-6 border border-surface hover:border-accent transition-all duration-300">
                      <h3 className="text-2xl font-semibold mb-2">Personal Website</h3>
                      <p className="text-secondary-text">The very site you are on. Built with Next.js and a passion for clean design.</p>
                  </div>
                  <div className="bg-surface rounded-lg p-6 border border-surface hover:border-accent transition-all duration-300">
                      <h3 className="text-2xl font-semibold mb-2">Data Visualizer</h3>
                      <p className="text-secondary-text">An interactive tool to visualize complex data sets using D3.js and React.</p>
                  </div>
                  <div className="bg-surface rounded-lg p-6 border border-surface hover:border-accent transition-all duration-300">
                      <h3 className="text-2xl font-semibold mb-2">Task Management App</h3>
                      <p className="text-secondary-text">A productivity app to help users organize their daily tasks and goals.</p>
                  </div>
              </div>
          </div>
      </section>

      <section id="writings" className="py-16">
          <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold border-b-2 border-accent inline-block pb-2">Latest Writings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Placeholder for Writing Cards */}
                  <div className="bg-surface rounded-lg p-6 border border-surface hover:border-accent transition-all duration-300">
                      <h3 className="text-2xl font-semibold mb-2">Deep Dive into Modern CSS</h3>
                      <p className="text-secondary-text">Exploring the power of Grid, Flexbox, and Custom Properties.</p>
                  </div>
                  <div className="bg-surface rounded-lg p-6 border border-surface hover:border-accent transition-all duration-300">
                      <h3 className="text-2xl font-semibold mb-2">Hello World: A New Journey</h3>
                      <p className="text-secondary-text">The obligatory first post documenting the start of a new digital space.</p>
                  </div>
              </div>
          </div>
      </section>
    </>
  );
}

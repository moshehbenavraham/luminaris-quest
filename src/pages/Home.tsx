import { useEffect, useRef, useMemo } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

// Generate deterministic particle positions for warm embers
function generateEmbers(count: number, seed: number) {
  const embers: Array<{
    id: number;
    left: string;
    top: string;
    delay: string;
    duration: string;
    size: 'small' | 'medium' | 'large';
    warmth: 'cream' | 'gold' | 'rose';
  }> = [];

  for (let i = 0; i < count; i++) {
    const pseudoRandom1 = ((i * 9301 + seed) % 49297) / 49297;
    const pseudoRandom2 = ((i * 7907 + seed * 2) % 49297) / 49297;
    const pseudoRandom3 = ((i * 6521 + seed * 3) % 49297) / 49297;
    const pseudoRandom4 = ((i * 5347 + seed * 4) % 49297) / 49297;

    let size: 'small' | 'medium' | 'large' = 'small';
    if (i % 13 === 0) size = 'large';
    else if (i % 6 === 0) size = 'medium';

    let warmth: 'cream' | 'gold' | 'rose' = 'cream';
    if (i % 11 === 0) warmth = 'gold';
    else if (i % 19 === 0) warmth = 'rose';

    embers.push({
      id: i,
      left: `${pseudoRandom1 * 100}%`,
      top: `${pseudoRandom2 * 100}%`,
      delay: `${pseudoRandom3 * 6}s`,
      duration: `${3 + pseudoRandom4 * 4}s`,
      size,
      warmth,
    });
  }

  return embers;
}

// Generate floating motes for auth section
function generateMotes(count: number, seed: number) {
  const motes: Array<{
    id: number;
    left: string;
    bottom: string;
    delay: string;
  }> = [];

  for (let i = 0; i < count; i++) {
    const pseudoRandom1 = ((i * 8461 + seed) % 49297) / 49297;
    const pseudoRandom2 = ((i * 7649 + seed * 2) % 49297) / 49297;

    motes.push({
      id: i,
      left: `${15 + pseudoRandom1 * 70}%`,
      bottom: `${pseudoRandom2 * 25}%`,
      delay: `${i * 1.2}s`,
    });
  }

  return motes;
}

// Generate gentle dust particles
function generateDust(count: number, seed: number) {
  const particles: Array<{
    id: number;
    left: string;
    delay: string;
    duration: string;
  }> = [];

  for (let i = 0; i < count; i++) {
    const pseudoRandom1 = ((i * 7333 + seed) % 49297) / 49297;
    const pseudoRandom2 = ((i * 6111 + seed * 2) % 49297) / 49297;

    particles.push({
      id: i,
      left: `${pseudoRandom1 * 100}%`,
      delay: `${pseudoRandom2 * 20}s`,
      duration: `${15 + pseudoRandom2 * 10}s`,
    });
  }

  return particles;
}

export function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  // Generate visual elements with stable seeds
  const embers = useMemo(() => generateEmbers(60, 42), []);
  const motes = useMemo(() => generateMotes(8, 17), []);
  const dustParticles = useMemo(() => generateDust(20, 31), []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const getEmberStyles = (ember: (typeof embers)[0]) => {
    const sizes = { small: 2, medium: 3, large: 4 };
    const colors = {
      cream: 'rgba(212, 207, 198, 0.8)',
      gold: 'rgba(232, 168, 124, 0.9)',
      rose: 'rgba(196, 145, 138, 0.85)',
    };
    const glows = {
      cream: '0 0 8px 2px rgba(232, 168, 124, 0.15)',
      gold: '0 0 12px 3px rgba(232, 168, 124, 0.3)',
      rose: '0 0 10px 2px rgba(196, 145, 138, 0.25)',
    };

    return {
      left: ember.left,
      top: ember.top,
      width: `${sizes[ember.size]}px`,
      height: `${sizes[ember.size]}px`,
      background: colors[ember.warmth],
      boxShadow: glows[ember.warmth],
      animationDelay: ember.delay,
      animationDuration: ember.duration,
    };
  };

  return (
    <div className="landing-bg">
      {/* Subtle Grain Texture */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Ambient Warmth Waves */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora__wave" />
        <div className="aurora__wave aurora__wave--secondary" />
        <div className="aurora__wave aurora__wave--tertiary" />
      </div>

      {/* Ember Particles */}
      <div className="starfield" aria-hidden="true">
        {embers.map((ember) => (
          <div key={ember.id} className="star" style={getEmberStyles(ember)} />
        ))}
      </div>

      {/* Gentle Dust */}
      <div className="cosmic-dust" aria-hidden="true">
        {dustParticles.map((particle) => (
          <div
            key={particle.id}
            className="dust-particle"
            style={{
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Geometric Accents */}
      <div className="sigil sigil--circle" style={{ top: '12%', left: '6%' }} aria-hidden="true" />
      <div
        className="sigil sigil--diamond"
        style={{ top: '65%', right: '8%' }}
        aria-hidden="true"
      />
      <div
        className="sigil sigil--triangle"
        style={{ bottom: '18%', left: '12%' }}
        aria-hidden="true"
      />

      {/* Ambient Glow Orbs */}
      <div className="orb orb--primary" style={{ top: '5%', left: '-15%' }} aria-hidden="true" />
      <div className="orb orb--accent" style={{ top: '55%', right: '-8%' }} aria-hidden="true" />
      <div className="orb orb--warm" style={{ bottom: '15%', left: '25%' }} aria-hidden="true" />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
          {/* Sanctuary Ring */}
          <div className="portal-frame" aria-hidden="true">
            <div className="portal-frame__ring portal-frame__ring--outer" />
            <div className="portal-frame__ring portal-frame__ring--mid" />
            <div className="portal-frame__ring portal-frame__ring--inner" />
          </div>

          <div className="relative z-10 max-w-3xl">
            {/* Tagline */}
            <p className="hero-tagline reveal">A Space for Healing</p>

            {/* Main Title */}
            <h1 className="hero-title-mystical reveal reveal-delay-1">
              <em>Luminari&apos;s</em> Quest
            </h1>

            {/* Decorative Divider */}
            <div className="divider-ornate reveal reveal-delay-2">
              <span className="divider-ornate__line" />
              <span className="divider-ornate__symbol" />
              <span className="divider-ornate__line" />
            </div>

            {/* Subtitle - More personal, less generic */}
            <p className="hero-subtitle-elegant reveal reveal-delay-2 mx-auto">
              You&apos;ve carried so much. This is a place to set it down, even just for a moment.
              Through story, reflection, and gentle play, discover what you already know about your
              own strength.
            </p>

            {/* CTA Button */}
            <div className="reveal reveal-delay-3 mt-12">
              <a
                href="#begin"
                className="btn-portal inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('begin')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Begin Your Journey
              </a>
            </div>

            {/* Scroll Indicator */}
            <div className="reveal reveal-delay-4 mt-20">
              <div className="scroll-indicator">
                <span className="scroll-indicator__text">Learn More</span>
                <span className="scroll-indicator__arrow" />
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* The Journey Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="fade-in-section" ref={featuresRef}>
              <h2 className="section-title">What This Space Offers</h2>
              <div className="divider-ornate mt-6">
                <span className="divider-ornate__line" />
                <span className="divider-ornate__symbol" />
                <span className="divider-ornate__line" />
              </div>
              <p className="font-body mt-8 text-base leading-relaxed text-[var(--taupe)]">
                Luminari&apos;s Quest was created for young adults who know what it&apos;s like to
                face the world before you were ready. Through interactive storytelling and guided
                reflection, you&apos;ll find tools for processing difficult experiences at your own
                pace, in your own way.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {/* Guardian Feature */}
            <article className="feature-card-enhanced fade-in-section">
              <div className="feature-card__icon feature-card__icon--guardian icon-glow">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2L2 7v6c0 5.55 4.84 10.74 10 12 5.16-1.26 10-6.45 10-12V7L12 2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="feature-card__title">Your Guardian</h3>
              <p className="feature-card__description">
                A gentle presence that grows with you. As trust builds between you, new
                possibilities open. There&apos;s no rush here.
              </p>
            </article>

            {/* Light & Shadow Feature */}
            <article
              className="feature-card-enhanced fade-in-section"
              style={{ transitionDelay: '0.15s' }}
            >
              <div className="feature-card__icon feature-card__icon--combat icon-glow">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                  <path
                    d="M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                    opacity="0.5"
                  />
                </svg>
              </div>
              <h3 className="feature-card__title">Light & Shadow</h3>
              <p className="feature-card__description">
                Face challenges through gameplay that mirrors real emotional work. Illuminate what
                needs seeing. Embrace what needs accepting.
              </p>
            </article>

            {/* Journal Feature */}
            <article
              className="feature-card-enhanced fade-in-section"
              style={{ transitionDelay: '0.3s' }}
            >
              <div className="feature-card__icon feature-card__icon--journal icon-glow">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                  <path d="M8 7h8m-8 4h5" />
                </svg>
              </div>
              <h3 className="feature-card__title">Your Journal</h3>
              <p className="feature-card__description">
                A private place to capture what surfaces. Write when it helps. Return to your words
                when you need them. Your story, your pace.
              </p>
            </article>
          </div>
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Quote Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <div className="quote-block-enhanced fade-in-section" ref={quoteRef}>
              <p className="quote-block__text">
                Between who you were and who you&apos;re becoming, there&apos;s a bridge. You
                don&apos;t have to build it alone. Every shadow you face teaches something. Every
                light you kindle stays with you.
              </p>
              <span className="quote-block__attribution">The Guardian</span>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* Auth Section */}
        <section id="begin" className="relative px-6 py-20">
          {/* Floating Ember Motes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {motes.map((mote) => (
              <div
                key={mote.id}
                className="mote"
                style={{
                  left: mote.left,
                  bottom: mote.bottom,
                  animationDelay: mote.delay,
                }}
              />
            ))}
          </div>

          <div className="mx-auto max-w-md">
            <div className="fade-in-section mb-8 text-center">
              <h2 className="section-title">Ready to Begin?</h2>
              <div className="divider-ornate mt-4">
                <span className="divider-ornate__line" />
                <span className="divider-ornate__symbol" />
                <span className="divider-ornate__line" />
              </div>
              <p className="font-body mt-4 text-sm text-[var(--taupe)]">
                Create your account to start. Everything here is private, and you can take as much
                time as you need.
              </p>
            </div>

            <div className="auth-wrapper fade-in-section" style={{ transitionDelay: '0.2s' }}>
              <AuthForm />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-14 text-center">
          <div className="divider-ornate mb-8">
            <span className="divider-ornate__line" />
            <span className="divider-ornate__symbol" />
            <span className="divider-ornate__line" />
          </div>
          <p className="font-display text-sm tracking-wide text-[var(--cream)] opacity-60">
            Luminari&apos;s Quest
          </p>
          <p className="font-body mt-2 text-xs text-[var(--taupe)] opacity-60">
            A sanctuary for healing through play
          </p>
          <p className="font-body mt-1 text-xs text-[var(--taupe)] opacity-40">
            Created with care for those finding their way forward
          </p>
        </footer>
      </main>
    </div>
  );
}

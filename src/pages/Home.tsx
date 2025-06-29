// Built with Bolt.new
import { AuthForm } from '@/components/auth/AuthForm';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

export function Home() {
  const homeHeroImage = imageRegistry.homeHero;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Welcome to Luminari's Quest
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Your journey to healing and growth begins here.
          </p>
        </div>

        {/* Image container with required test classes - Natural sizing for proper layout flow */}
        <div className="mt-6 mb-16 relative z-0">
          <ImpactfulImage
            data-testid="impactful-image"
            src={homeHeroImage.avif || homeHeroImage.src}
            alt={homeHeroImage.alt}
            priority={homeHeroImage.priority}
            fallback={homeHeroImage.fallback}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Auth form container with required test classes */}
        <div className="mt-16 relative z-10 clear-both">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}

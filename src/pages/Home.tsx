import { AuthForm } from '@/components/auth/AuthForm';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

export function Home() {
  const homeHeroImage = imageRegistry.homeHero;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Welcome to Luminari&apos;s Quest
          </h1>
          <p className="text-muted-foreground mt-4 text-xl">
            Your journey to healing and growth begins here.
          </p>
        </div>

        {/* Image container with required test classes - Natural sizing for proper layout flow */}
        <div className="relative z-0 mt-6 mb-16">
          <ImpactfulImage
            data-testid="impactful-image"
            src={homeHeroImage.avif || homeHeroImage.src}
            alt={homeHeroImage.alt}
            priority={homeHeroImage.priority}
            fallback={homeHeroImage.fallback}
            className="h-auto w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Auth form container with required test classes */}
        <div className="relative z-10 clear-both mt-16">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}

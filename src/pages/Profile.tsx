import { HealthStatus } from '@/components/HealthStatus';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

export function Profile() {
  const profileHeroImage = imageRegistry.profileHero;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Profile
        </h1>
        <p className="text-xl text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Profile Hero Image - Mobile-first at logical top-of-fold position */}
      <div className="mb-6">
        <ImpactfulImage
          data-testid="impactful-image"
          src={profileHeroImage.avif || profileHeroImage.src}
          alt={profileHeroImage.alt}
          ratio={profileHeroImage.aspectRatio}
          priority={profileHeroImage.priority}
          fallback={profileHeroImage.fallback}
          className="md:rounded-full md:max-w-[280px] mx-auto"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-2xl font-bold">System Status</h2>
          <HealthStatus showDetails className="max-w-md" />
        </div>
        
        <div>
          <h2 className="mb-3 text-2xl font-bold">Account Settings</h2>
          <p className="text-muted-foreground">
            Account management features will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}

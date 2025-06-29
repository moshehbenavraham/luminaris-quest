import { HealthStatus } from '@/components/HealthStatus';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useGameStoreBase } from '@/store/game-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Profile() {
  const profileHeroImage = imageRegistry.profileHero;
  const { saveNow, saveStatus, hasUnsavedChanges } = useAutoSave();
  const saveToSupabase = useGameStoreBase(state => state.saveToSupabase);
  const saveState = useGameStoreBase(state => state.saveState);

  const handleManualSave = async () => {
    await saveToSupabase();
  };

  const formatLastSave = () => {
    if (!saveState.lastSaveTimestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - saveState.lastSaveTimestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return new Date(saveState.lastSaveTimestamp).toLocaleDateString();
  };

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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="mb-3 text-2xl font-bold">System Status</h2>
          <HealthStatus showDetails className="max-w-md" />
        </div>
        
        <div>
          <h2 className="mb-3 text-2xl font-bold">Save Management</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Save Status
                <SaveStatusIndicator />
              </CardTitle>
              <CardDescription>
                Manage your game progress and save settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Last Saved</p>
                  <p className="text-muted-foreground">{formatLastSave()}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-muted-foreground capitalize">{saveStatus}</p>
                </div>
              </div>
              
              {saveState.lastError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-800">Save Error</p>
                  <p className="text-sm text-red-600">{saveState.lastError}</p>
                  {saveState.retryCount > 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Retried {saveState.retryCount} times
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleManualSave}
                  disabled={saveStatus === 'saving'}
                  className="flex-1"
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Now'}
                </Button>
                
                {hasUnsavedChanges && (
                  <Button 
                    variant="outline"
                    onClick={saveNow}
                    disabled={saveStatus === 'saving'}
                    className="flex-1"
                  >
                    Quick Save
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>• Auto-save is enabled by default</p>
                <p>• Progress saves automatically every 30 seconds</p>
                <p>• Critical events trigger immediate saves</p>
              </div>
            </CardContent>
          </Card>
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

import { useState, useEffect } from 'react';
import { HealthStatus } from '@/components/HealthStatus';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useGameStoreBase } from '@/store/game-store';
import { useSettingsStore } from '@/store/settings-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Profile() {
  const profileHeroImage = imageRegistry.profileHero;
  const { saveNow, saveStatus, hasUnsavedChanges } = useAutoSave();
  const saveToSupabase = useGameStoreBase((state) => state.saveToSupabase);
  const saveState = useGameStoreBase((state) => state.saveState);

  // Settings store
  const settings = useSettingsStore();

  // Track current time in state (React 19 purity compliance)
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    // Update current time every 10 seconds for accurate "time ago" display
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSave = async () => {
    await saveToSupabase();
  };

  const formatLastSave = () => {
    if (!saveState.lastSaveTimestamp) return 'Never';

    const diff = currentTime - saveState.lastSaveTimestamp;

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
        <p className="text-muted-foreground text-xl">Manage your account and preferences.</p>
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
          className="mx-auto md:max-w-[280px] md:rounded-full"
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
              <CardDescription>Manage your game progress and save settings</CardDescription>
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
                    <p className="mt-1 text-xs text-red-500">
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

              <div className="text-muted-foreground text-xs">
                <p>• Auto-save is enabled by default</p>
                <p>• Progress saves automatically every 30 seconds</p>
                <p>• Critical events trigger immediate saves</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audio Settings */}
        <div>
          <h2 className="mb-3 text-2xl font-bold">Audio Settings</h2>
          <Card>
            <CardHeader>
              <CardTitle>Sound Preferences</CardTitle>
              <CardDescription>Adjust volume and mute settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="master-volume">Master Volume</Label>
                  <span className="text-muted-foreground text-sm">
                    {Math.round(settings.audio.masterVolume * 100)}%
                  </span>
                </div>
                <Slider
                  id="master-volume"
                  value={[settings.audio.masterVolume * 100]}
                  onValueChange={([value]) => settings.setMasterVolume(value / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="music-mute">Mute Music</Label>
                <Switch
                  id="music-mute"
                  checked={settings.audio.musicMuted}
                  onCheckedChange={settings.toggleMusicMute}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sfx-mute">Mute Sound Effects</Label>
                <Switch
                  id="sfx-mute"
                  checked={settings.audio.sfxMuted}
                  onCheckedChange={settings.toggleSfxMute}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Settings */}
        <div>
          <h2 className="mb-3 text-2xl font-bold">Accessibility</h2>
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Options</CardTitle>
              <CardDescription>Customize your experience for better accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text-size">Text Size</Label>
                <Select
                  value={settings.accessibility.textSize}
                  onValueChange={(value: 'small' | 'medium' | 'large') =>
                    settings.setTextSize(value)
                  }
                >
                  <SelectTrigger id="text-size">
                    <SelectValue placeholder="Select text size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-muted-foreground text-xs">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.accessibility.reducedMotion}
                  onCheckedChange={settings.toggleReducedMotion}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast">High Contrast</Label>
                  <p className="text-muted-foreground text-xs">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.accessibility.highContrast}
                  onCheckedChange={settings.toggleHighContrast}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* UI Preferences */}
        <div>
          <h2 className="mb-3 text-2xl font-bold">UI Preferences</h2>
          <Card>
            <CardHeader>
              <CardTitle>Interface Settings</CardTitle>
              <CardDescription>Customize the user interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="combat-ui">Combat Interface</Label>
                <Select
                  value={settings.ui.combatUI}
                  onValueChange={(value: 'legacy' | 'new') => settings.setCombatUI(value)}
                >
                  <SelectTrigger id="combat-ui">
                    <SelectValue placeholder="Select combat UI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Modern (Recommended)</SelectItem>
                    <SelectItem value="legacy">Classic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tooltip-verbosity">Tooltip Detail Level</Label>
                <Select
                  value={settings.ui.tooltipVerbosity}
                  onValueChange={(value: 'minimal' | 'normal' | 'detailed') =>
                    settings.setTooltipVerbosity(value)
                  }
                >
                  <SelectTrigger id="tooltip-verbosity">
                    <SelectValue placeholder="Select tooltip detail" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tutorial & Reset */}
        <div>
          <h2 className="mb-3 text-2xl font-bold">Tutorial</h2>
          <Card>
            <CardHeader>
              <CardTitle>Tutorial Progress</CardTitle>
              <CardDescription>Manage your onboarding experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Welcome Seen</p>
                  <p className="text-muted-foreground">
                    {settings.tutorial.hasSeenWelcome ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Combat Intro Seen</p>
                  <p className="text-muted-foreground">
                    {settings.tutorial.hasSeenCombatIntro ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Dismissed Tooltips</p>
                <p className="text-muted-foreground text-sm">
                  {settings.tutorial.dismissedTooltips.length} tooltips dismissed
                </p>
              </div>
              <Button variant="outline" onClick={settings.resetTutorialState} className="w-full">
                Reset Tutorial Progress
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reset All Settings */}
        <div>
          <h2 className="mb-3 text-2xl font-bold">Reset Settings</h2>
          <Card>
            <CardHeader>
              <CardTitle>Reset All Preferences</CardTitle>
              <CardDescription>Restore all settings to their default values</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={settings.resetSettings} className="w-full">
                Reset All Settings to Default
              </Button>
              <p className="text-muted-foreground mt-2 text-center text-xs">
                This will reset audio, accessibility, UI, and tutorial settings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

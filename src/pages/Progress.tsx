import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, BookOpen, Calendar, Award } from 'lucide-react';
import { JournalEntryCard } from '@/components/JournalEntryCard';
import { useGameStore } from '@/store/game-store';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

export function Progress() {
  const { guardianTrust, journalEntries, milestones, updateJournalEntry, deleteJournalEntry } =
    useGameStore();
  const progressHeroImage = imageRegistry.progressHero;

  const getTrustLabel = (trust: number): string => {
    if (trust >= 75) return 'Unbreakable Bond';
    if (trust >= 50) return 'Strong Connection';
    if (trust >= 25) return 'Growing Trust';
    return 'New Bond';
  };

  const getTrustColor = (trust: number): string => {
    if (trust >= 75) return 'bg-gradient-to-r from-purple-500 to-purple-600';
    if (trust >= 50) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (trust >= 25) return 'bg-gradient-to-r from-green-500 to-green-600';
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-4xl space-y-8 lg:space-y-10">
        <div>
          <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Progress
          </h1>
          <p className="text-xl text-muted-foreground">Track your journey and achievements.</p>
        </div>

        {/* Progress Hero Image - Natural sizing for proper layout flow */}
        <ImpactfulImage
          data-testid="impactful-image"
          src={progressHeroImage.avif || progressHeroImage.src}
          alt={progressHeroImage.alt}
          priority={progressHeroImage.priority}
          fallback={progressHeroImage.fallback}
          className="w-full h-auto md:rounded-xl"
        />

        {/* Trust Level Progress */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Guardian Trust Bond
          </CardTitle>
          <CardDescription>
            Your connection with your guardian spirit grows stronger through each choice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Level</span>
            <span className="text-lg font-bold">{getTrustLabel(guardianTrust)}</span>
          </div>

          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700">
            <div
              className={`h-full transition-all duration-700 ease-out ${getTrustColor(guardianTrust)} shadow-sm`}
              style={{ width: `${guardianTrust}%` }}
            />
          </div>

          <div className="text-center">
            <span className="text-2xl font-bold">{guardianTrust}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </CardContent>
        </Card>

        {/* Milestone Badges */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Milestones Achieved
          </CardTitle>
          <CardDescription>Celebrate your growth and healing journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {milestones
              .filter(
                (milestone, index, arr) =>
                  // Remove duplicates by level
                  arr.findIndex((m) => m.level === milestone.level) === index,
              )
              .slice(0, 6) // Limit to max 6 milestones
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className={`min-h-[44px] rounded-lg border-2 p-4 transition-all duration-300 ${
                    milestone.achieved
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20'
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
                  }`}
                >
                  <div className="space-y-2 text-center">
                    <div
                      className={`text-2xl ${milestone.achieved ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                      {milestone.achieved ? '🏆' : '🔒'}
                    </div>
                    <div className="font-semibold">{milestone.label}</div>
                    <Badge variant={milestone.achieved ? 'default' : 'secondary'}>
                      Trust {milestone.level}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
        </Card>

        {/* Journal Entries */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Journal Entries
          </CardTitle>
          <CardDescription>Reflections from your healing journey</CardDescription>
        </CardHeader>
        <CardContent>
          {journalEntries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>Your journal entries will appear here as you progress through your adventure.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journalEntries
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((entry, index) => {
                  // Add error boundary for individual entries
                  try {
                    return (
                      <JournalEntryCard
                        key={entry.id}
                        entry={entry}
                        onUpdate={updateJournalEntry}
                        onDelete={deleteJournalEntry}
                      />
                    );
                  } catch (error) {
                    console.error('Error rendering journal entry:', error, entry);
                    return (
                      <Card key={entry.id || `error-${index}`} className="border-red-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-red-600">Error displaying journal entry</p>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect } from 'react';
import { ChoiceList } from '@/components/ChoiceList';
import { GuardianText } from '@/components/GuardianText';
import { JournalModal, type JournalEntry } from '@/components/JournalModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StatsBar } from '@/components/StatsBar';
import { useGameStore } from '@/store/game-store';
import { useAutoSave } from '@/hooks/use-auto-save';
import AudioPlayer from '@/components/organisms/AudioPlayer';
import { audioPlaylist } from '@/data/audioPlaylist';
import { ImpactfulImage } from '@/components/atoms/ImpactfulImage';
import { imageRegistry } from '@/data/imageRegistry';

// Feature flag for AudioPlayer integration
const ENABLE_AUDIO_PLAYER = true;

export function Adventure() {
  const {
    guardianTrust,
    setGuardianTrust,
    addJournalEntry,
    pendingMilestoneJournals,
    markMilestoneJournalShown,
    currentSceneIndex,
    playerEnergy,
    _hasHydrated,
  } = useGameStore();

  // Get manual save trigger from auto-save hook
  const { saveNow } = useAutoSave();

  const [isClient, setIsClient] = useState(false);
  const [guardianMessage, setGuardianMessage] = useState(
    'I am your guardian spirit, here to guide and support you on this journey. Your choices shape our bond and your path forward.',
  );
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalTrigger, setJournalTrigger] = useState<'milestone' | 'learning'>('milestone');
  const [currentMilestoneLevel, setCurrentMilestoneLevel] = useState<number | null>(null);

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple milestone check when pendingMilestoneJournals changes
  useEffect(() => {
    if (!_hasHydrated || !isClient || showJournalModal) return;
    
    if (pendingMilestoneJournals && pendingMilestoneJournals.size > 0) {
      const pendingLevels = Array.from(pendingMilestoneJournals) as number[];
      const levelToShow = pendingLevels[0];
      
      setCurrentMilestoneLevel(levelToShow);
      setJournalTrigger('milestone');
      setShowJournalModal(true);
    }
  }, [pendingMilestoneJournals, _hasHydrated, isClient, showJournalModal]);

  const handleSaveJournalEntry = useCallback(
    (entry: JournalEntry) => {
      try {
        if (entry && entry.id && entry.content) {
          // Add scene ID if we're on a scene
          const enhancedEntry = {
            ...entry,
            sceneId: currentSceneIndex > 0 ? `scene-${currentSceneIndex}` : undefined,
          };
          addJournalEntry(enhancedEntry);

          // If this was a milestone journal, mark it as shown
          if (entry.type === 'milestone' && currentMilestoneLevel !== null) {
            markMilestoneJournalShown(currentMilestoneLevel);
            setCurrentMilestoneLevel(null);
          }

          // Trigger immediate save after journal entry creation
          saveNow();
        }
      } catch (error) {
        console.error('Error saving journal entry:', error);
      }
    },
    [addJournalEntry, currentSceneIndex, currentMilestoneLevel, markMilestoneJournalShown, saveNow],
  );

  const handleSceneComplete = useCallback((_sceneId: string, success: boolean) => {
    // Trigger a learning journal on scene failure
    if (!success) {
      setJournalTrigger('learning');
      setShowJournalModal(true);
    }
    
    // Trigger immediate save after scene completion
    saveNow();
  }, [saveNow]);

  const handleLearningMoment = useCallback(() => {
    setJournalTrigger('learning');
    setShowJournalModal(true);
  }, []);

  // Don't render anything until hydration is complete
  if (!isClient || !_hasHydrated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  const adventureHeroImage = imageRegistry.adventureHero;

  return (
    <ErrorBoundary>
      {/* Mobile-first container with generous spacing and proper padding */}
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl space-y-8 lg:space-y-10">
          {/* Adventure Hero Image - Mobile-first at top-of-fold position */}
          <ImpactfulImage
            data-testid="impactful-image"
            src={adventureHeroImage.avif || adventureHeroImage.src}
            alt={adventureHeroImage.alt}
            ratio={adventureHeroImage.aspectRatio}
            priority={adventureHeroImage.priority}
            fallback={adventureHeroImage.fallback}
            className="md:rounded-xl md:max-h-[420px]"
          />

          {/* Guardian Text with clear visual separation */}
          <GuardianText trust={guardianTrust} message={guardianMessage} data-testid="guardian-text" />

          {/* Stats Bar - Shows LP/SP resources for combat awareness */}
          <StatsBar
            trust={guardianTrust}
            energy={playerEnergy}
            className="mb-6"
            data-testid="adventure-stats-bar"
          />

          {/* Audio Player with consistent spacing */}
          {ENABLE_AUDIO_PLAYER && (
            <AudioPlayer tracks={audioPlaylist} />
          )}

          {/* Choice List with adequate spacing for touch targets */}
          <ChoiceList
            guardianTrust={guardianTrust}
            setGuardianTrust={setGuardianTrust}
            setGuardianMessage={setGuardianMessage}
            onSceneComplete={handleSceneComplete}
            onLearningMoment={handleLearningMoment}
            data-testid="choice-list"
          />

          {/* Journal Modal - positioned outside main flow */}
          <JournalModal
            isOpen={showJournalModal}
            onClose={() => {
              setShowJournalModal(false);
              setCurrentMilestoneLevel(null);
            }}
            trustLevel={guardianTrust}
            triggerType={journalTrigger}
            onSaveEntry={handleSaveJournalEntry}
            data-testid="journal-modal"
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

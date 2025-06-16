import { useState, useCallback, useEffect, useRef } from 'react';
import { ChoiceList } from '@/components/ChoiceList';
import { GuardianText } from '@/components/GuardianText';
import { JournalModal, type JournalEntry } from '@/components/JournalModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useGameStore } from '@/store/game-store';

export function Adventure() {
  const {
    guardianTrust,
    setGuardianTrust,
    addJournalEntry,
    pendingMilestoneJournals,
    markMilestoneJournalShown,
    currentSceneIndex,
    _hasHydrated,
  } = useGameStore();

  const [isClient, setIsClient] = useState(false);
  const [guardianMessage, setGuardianMessage] = useState(
    'I am your guardian spirit, here to guide and support you on this journey. Your choices shape our bond and your path forward.',
  );
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalTrigger, setJournalTrigger] = useState<'milestone' | 'learning'>('milestone');
  const [currentMilestoneLevel, setCurrentMilestoneLevel] = useState<number | null>(null);
  const isCheckingMilestones = useRef(false);

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to check for new milestones
  const checkForNewMilestones = useCallback(() => {
    console.log(`🎯 [ADVENTURE] checkForNewMilestones called`);
    console.log(`🎯 [ADVENTURE] isCheckingMilestones.current:`, isCheckingMilestones.current);
    console.log(`🎯 [ADVENTURE] showJournalModal:`, showJournalModal);
    console.log(`🎯 [ADVENTURE] pendingMilestoneJournals:`, pendingMilestoneJournals);
    
    if (isCheckingMilestones.current || showJournalModal) return;
    
    isCheckingMilestones.current = true;
    
    try {
      if (pendingMilestoneJournals && pendingMilestoneJournals.size > 0) {
        const pendingLevels = Array.from(pendingMilestoneJournals) as number[];
        if (pendingLevels.length > 0) {
          const levelToShow = pendingLevels[0];
          setCurrentMilestoneLevel(levelToShow);
          setJournalTrigger('milestone');
          setShowJournalModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking pending milestones:', error);
    } finally {
      setTimeout(() => {
        isCheckingMilestones.current = false;
      }, 1000);
    }
  }, [showJournalModal, pendingMilestoneJournals]);

  // Log when useCallback dependencies change
  useEffect(() => {
    console.log(`🔄 [ADVENTURE] checkForNewMilestones dependencies changed!`);
    console.log(`🔄 [ADVENTURE] - showJournalModal:`, showJournalModal);
    console.log(`🔄 [ADVENTURE] - pendingMilestoneJournals:`, pendingMilestoneJournals);
    console.log(`🔄 [ADVENTURE] - pendingMilestoneJournals reference:`, pendingMilestoneJournals);
  }, [showJournalModal, pendingMilestoneJournals]);

  // Only check for milestones when trust level changes
  useEffect(() => {
    if (!_hasHydrated || !isClient) return;

    const timeoutId = setTimeout(() => {
      if (isCheckingMilestones.current || showJournalModal) return;
      
      isCheckingMilestones.current = true;
      
      try {
        if (pendingMilestoneJournals && pendingMilestoneJournals.size > 0) {
          const pendingLevels = Array.from(pendingMilestoneJournals) as number[];
          if (pendingLevels.length > 0) {
            const levelToShow = pendingLevels[0];
            setCurrentMilestoneLevel(levelToShow);
            setJournalTrigger('milestone');
            setShowJournalModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking pending milestones:', error);
      } finally {
        setTimeout(() => {
          isCheckingMilestones.current = false;
        }, 1000);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [guardianTrust]); // Only depend on trust level, nothing else

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
        }
      } catch (error) {
        console.error('Error saving journal entry:', error);
      }
    },
    [addJournalEntry, currentSceneIndex, currentMilestoneLevel, markMilestoneJournalShown],
  );

  const handleSceneComplete = useCallback((_sceneId: string, success: boolean) => {
    // Trigger a learning journal on scene failure
    if (!success) {
      setJournalTrigger('learning');
      setShowJournalModal(true);
    }
  }, []);

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

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <GuardianText trust={guardianTrust} message={guardianMessage} />
        <ChoiceList
          guardianTrust={guardianTrust}
          setGuardianTrust={setGuardianTrust}
          setGuardianMessage={setGuardianMessage}
          onSceneComplete={handleSceneComplete}
          onLearningMoment={handleLearningMoment}
        />
        <JournalModal
          isOpen={showJournalModal}
          onClose={() => {
            console.log(`🚪 [ADVENTURE] Modal closing - setting up setTimeout`);
            setShowJournalModal(false);
            setCurrentMilestoneLevel(null);
            // Check for more milestones after closing
            setTimeout(() => {
              console.log(`⏰ [ADVENTURE] setTimeout fired - calling checkForNewMilestones`);
              checkForNewMilestones();
            }, 100);
          }}
          trustLevel={guardianTrust}
          triggerType={journalTrigger}
          onSaveEntry={handleSaveJournalEntry}
        />
      </div>
    </ErrorBoundary>
  );
}

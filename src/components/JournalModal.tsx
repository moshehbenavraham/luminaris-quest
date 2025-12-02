import { useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, BookOpen, Sparkles, TrendingUp } from 'lucide-react';

// Generate unique ID outside of render for purity
let idCounter = 0;
const generateId = () => `journal-${Date.now()}-${++idCounter}`;

export interface JournalEntry {
  id: string;
  type: 'milestone' | 'learning';
  trustLevel: number;
  content: string;
  timestamp: Date;
  title: string;
  sceneId?: string;
  tags?: string[];
  isEdited?: boolean;
  editedAt?: Date;
}

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  trustLevel: number;
  triggerType: 'milestone' | 'learning';
  onSaveEntry: (_entry: JournalEntry) => void;
  'data-testid'?: string;
}

const getJournalContent = (trustLevel: number, triggerType: 'milestone' | 'learning') => {
  if (triggerType === 'learning') {
    return {
      title: 'A Learning Moment',
      content:
        'Sometimes setbacks help us discover new paths. Every challenge is an opportunity to grow stronger and wiser. Your guardian spirit believes in your resilience.',
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
    };
  }

  // Milestone content based on trust level
  if (trustLevel >= 75) {
    return {
      title: 'Deep Connection Achieved',
      content:
        "Your guardian spirit sees your growing confidence and inner strength. You've learned to trust yourself and others, finding balance in both courage and wisdom.",
      icon: <Sparkles className="h-6 w-6 text-purple-500" />,
    };
  } else if (trustLevel >= 50) {
    return {
      title: 'Finding Your Balance',
      content:
        "You're finding balance between courage and wisdom. Your journey shows remarkable growth, and your guardian spirit feels the deepening bond between you.",
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    };
  } else if (trustLevel >= 25) {
    return {
      title: 'Inner Strength Discovered',
      content:
        "Every challenge teaches us about our inner strength. You're beginning to understand your own resilience, and your guardian spirit watches with growing pride.",
      icon: <Heart className="h-6 w-6 text-red-500" />,
    };
  }

  return {
    title: 'Beginning Your Journey',
    content:
      'Your path of healing and growth begins here. Trust in yourself and the journey ahead.',
    icon: <Heart className="h-6 w-6 text-gray-500" />,
  };
};

export function JournalModal({
  isOpen,
  onClose,
  trustLevel,
  triggerType,
  onSaveEntry,
  'data-testid': testId,
}: JournalModalProps) {
  const savedForThisOpenRef = useRef(false);
  const journalContent = getJournalContent(trustLevel, triggerType);

  // Memoize the save callback to prevent effect re-runs
  const handleSaveEntry = useCallback(() => {
    const entry: JournalEntry = {
      id: generateId(),
      type: triggerType,
      trustLevel,
      content: journalContent.content,
      timestamp: new Date(),
      title: journalContent.title,
    };
    onSaveEntry(entry);
  }, [triggerType, trustLevel, journalContent.content, journalContent.title, onSaveEntry]);

  // Auto-save entry when modal opens (only once per open cycle)
  useEffect(() => {
    if (isOpen && !savedForThisOpenRef.current) {
      savedForThisOpenRef.current = true;
      handleSaveEntry();
    } else if (!isOpen) {
      // Reset flag when closed so next open will save again
      savedForThisOpenRef.current = false;
    }
  }, [isOpen, handleSaveEntry]);

  return (
    <>
      {/* Always render a hidden element with test ID for testing purposes */}
      {!isOpen && <div data-testid={testId} style={{ display: 'none' }} />}

      <Dialog open={isOpen} onOpenChange={onClose} data-testid={isOpen ? testId : undefined}>
        <DialogContent
          className={`transition-all duration-300 sm:max-w-md ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {journalContent.icon}
              Journal Entry
            </DialogTitle>
            <DialogDescription>A moment of reflection on your healing journey</DialogDescription>
          </DialogHeader>

          <Card className="border-none shadow-none">
            <CardContent className="space-y-4 p-0">
              <div className="space-y-2 text-center">
                <h3 className="text-foreground text-lg font-semibold">{journalContent.title}</h3>
                <div className="text-muted-foreground text-sm">Trust Level: {trustLevel}/100</div>
              </div>

              <div className="rounded-lg border-l-4 border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:from-purple-950/20 dark:to-blue-950/20">
                <blockquote className="text-foreground text-base leading-relaxed italic">
                  &ldquo;{journalContent.content}&rdquo;
                </blockquote>
              </div>

              <div className="text-muted-foreground text-center text-xs">
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button
              onClick={onClose}
              className="w-full"
              aria-label="Close journal entry and continue"
            >
              Continue Journey
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

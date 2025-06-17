import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, BookOpen, Sparkles, TrendingUp } from 'lucide-react';

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
  onSaveEntry: (entry: JournalEntry) => void;
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
}: JournalModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [savedForThisOpen, setSavedForThisOpen] = useState(false);
  const journalContent = getJournalContent(trustLevel, triggerType);

  useEffect(() => {
    if (isOpen && !savedForThisOpen) {
      setIsVisible(true);
      setSavedForThisOpen(true);
      
      // Save the journal entry when modal opens
      const entry: JournalEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: triggerType,
        trustLevel,
        content: journalContent.content,
        timestamp: new Date(),
        title: journalContent.title,
      };
      
      onSaveEntry(entry);
    } else if (!isOpen && savedForThisOpen) {
      // Reset for next open
      setSavedForThisOpen(false);
    }
  }, [isOpen, savedForThisOpen, triggerType, trustLevel, journalContent.content, journalContent.title, onSaveEntry]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`transition-all duration-300 sm:max-w-md ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        aria-labelledby="journal-title"
        aria-describedby="journal-description"
      >
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle id="journal-title" className="flex items-center gap-2 text-xl">
            {journalContent.icon}
            Journal Entry
          </DialogTitle>
          <DialogDescription id="journal-description">
            A moment of reflection on your healing journey
          </DialogDescription>
        </div>

        <Card className="border-none shadow-none">
          <CardContent className="space-y-4 p-0">
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold text-foreground">{journalContent.title}</h3>
              <div className="text-sm text-muted-foreground">Trust Level: {trustLevel}/100</div>
            </div>

            <div className="rounded-lg border-l-4 border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:from-purple-950/20 dark:to-blue-950/20">
              <blockquote className="text-base italic leading-relaxed text-foreground">
                "{journalContent.content}"
              </blockquote>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleClose}
            className="w-full"
            aria-label="Close journal entry and continue"
          >
            Continue Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

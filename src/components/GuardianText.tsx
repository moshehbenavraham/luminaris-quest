import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';

interface GuardianTextProps {
  trust: number;
  message: string;
  className?: string;
  'data-testid'?: string;
}

export function GuardianText({ trust, message, className, 'data-testid': testId }: GuardianTextProps) {
  const [hasShownIntro, setHasShownIntro] = useState(false);

  useEffect(() => {
    // Check if this is the initial guardian introduction
    const isIntroMessage = message.includes('I am your guardian spirit');
    if (isIntroMessage && !hasShownIntro) {
      setHasShownIntro(true);
    }
  }, [message, hasShownIntro]);

  const getTrustColor = (trustLevel: number) => {
    if (trustLevel >= 80) return 'bg-green-500';
    if (trustLevel >= 60) return 'bg-blue-500';
    if (trustLevel >= 40) return 'bg-yellow-500';
    if (trustLevel >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrustLabel = (trustLevel: number) => {
    if (trustLevel >= 80) return 'Deep Bond';
    if (trustLevel >= 60) return 'Strong Trust';
    if (trustLevel >= 40) return 'Growing Bond';
    if (trustLevel >= 20) return 'Cautious Trust';
    return 'Fragile Bond';
  };

  // Ensure trust is within bounds
  const normalizedTrust = Math.max(0, Math.min(100, trust));

  // Only show intro message once, then show scene outcomes
  const isIntroMessage = message.includes('I am your guardian spirit');
  const shouldShowMessage = !isIntroMessage || !hasShownIntro;

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Guardian Spirit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {shouldShowMessage && message && (
          <div className="rounded-lg border-l-4 border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:from-purple-950/20 dark:to-blue-950/20">
            <blockquote className="text-lg font-medium italic leading-relaxed text-foreground">
              "              &ldquo;{message}&rdquo;"
            </blockquote>
          </div>
        )}

        <div className="space-y-3 border-t border-muted pt-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Trust Bond</span>
            </div>
            <span className="text-base font-semibold">{getTrustLabel(normalizedTrust)}</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700">
            <div
              className={`h-full transition-all duration-700 ease-out ${getTrustColor(normalizedTrust)} shadow-sm`}
              style={{ width: `${normalizedTrust}%` }}
            />
          </div>

          <div className="text-center text-sm font-medium text-muted-foreground">
            {normalizedTrust}/100
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

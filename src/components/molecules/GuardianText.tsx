/* eslint-disable react-hooks/set-state-in-effect -- Intentional: "show once" pattern requires state update in effect to trigger re-render that hides the intro message */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';

interface GuardianTextProps {
  trust: number;
  message: string;
  className?: string;
  'data-testid'?: string;
}

export function GuardianText({
  trust,
  message,
  className,
  'data-testid': testId,
}: GuardianTextProps) {
  const hasShownIntroRef = useRef(false);
  const [hasShownIntro, setHasShownIntro] = useState(false);

  // Track intro message and update state when shown
  // This pattern intentionally sets state in effect to trigger a re-render
  // that hides the intro message after it's been displayed once
  useEffect(() => {
    const isIntro = message.includes('I am your guardian spirit');
    if (isIntro && !hasShownIntroRef.current) {
      hasShownIntroRef.current = true;
      setHasShownIntro(true);
    }
  }, [message]);

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
  const currentIsIntro = message.includes('I am your guardian spirit');
  const shouldShowMessage = !currentIsIntro || !hasShownIntro;

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
            <blockquote className="text-foreground text-lg leading-relaxed font-medium italic">
              &ldquo;{message}&rdquo;
            </blockquote>
          </div>
        )}

        <div className="border-muted space-y-3 border-t pt-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Trust Bond</span>
            </div>
            <span className="text-base font-semibold">{getTrustLabel(normalizedTrust)}</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700">
            <div
              className={`progress-bar-fill h-full ${getTrustColor(normalizedTrust)} shadow-sm`}
              style={{ '--progress-value': normalizedTrust } as React.CSSProperties}
            />
          </div>

          <div className="text-muted-foreground text-center text-sm font-medium">
            {normalizedTrust}/100
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

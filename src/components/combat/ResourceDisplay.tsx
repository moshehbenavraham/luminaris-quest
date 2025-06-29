// Built with Bolt.new

/**
 * ⚠️⚠️⚠️ DEPRECATED - OLD COMBAT SYSTEM ⚠️⚠️⚠️
 * 
 * This file is part of the DEPRECATED combat system.
 * It only exists for backwards compatibility when using ?legacyCombat=1
 * 
 * DO NOT USE THIS FILE FOR NEW DEVELOPMENT!
 * 
 * For new development, use the NEW combat system at:
 * → /src/features/combat/
 * 
 * See COMBAT_MIGRATION_GUIDE.md for migration details.
 * 
 * ⚠️⚠️⚠️ DEPRECATED - OLD COMBAT SYSTEM ⚠️⚠️⚠️
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Sword } from 'lucide-react';

/**
 * ResourceDisplay - Standalone component for displaying Light Points and Shadow Points
 * 
 * This component provides a reusable interface for showing combat resources with:
 * - Light Points display with amber theme and Sparkles icon
 * - Shadow Points display with purple theme and Sword icon
 * - Visual feedback for resource changes with animations
 * - Configurable display modes (compact/detailed)
 * - Consistent styling with the combat system design
 */

export interface ResourceDisplayProps {
  /** Light Points value */
  lp: number;
  /** Shadow Points value */
  sp: number;
  /** Display mode - compact shows smaller layout, detailed shows full layout */
  mode?: 'compact' | 'detailed';
  /** Show animated changes when resources update */
  showAnimations?: boolean;
  /** Optional title for the resource display */
  title?: string;
  /** Optional test ID for testing */
  'data-testid'?: string;
  /** Optional className for additional styling */
  className?: string;
}

export function ResourceDisplay({
  lp,
  sp,
  mode = 'detailed',
  showAnimations = true,
  title = 'Resources',
  'data-testid': testId,
  className = ''
}: ResourceDisplayProps) {
  // Animation configuration for resource changes
  const animationProps = showAnimations ? {
    animate: { scale: [1, 1.1, 1] },
    transition: { duration: 0.3 }
  } : {};

  // Compact mode renders a simplified horizontal layout
  if (mode === 'compact') {
    return (
      <div 
        className={`flex items-center gap-4 ${className}`}
        data-testid={testId || 'resource-display-compact'}
      >
        {/* Light Points - Compact */}
        <motion.div
          className="flex items-center gap-2"
          {...animationProps}
          key={`lp-${lp}`}
        >
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">LP</p>
            <p className="text-lg font-bold combat-text-critical">
              {lp}
            </p>
          </div>
        </motion.div>
        
        {/* Shadow Points - Compact */}
        <motion.div
          className="flex items-center gap-2"
          {...animationProps}
          key={`sp-${sp}`}
        >
          <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center">
            <Sword className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">SP</p>
            <p className="text-lg font-bold combat-text-mana">
              {sp}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Detailed mode renders the full card layout
  return (
    <Card 
      className={`bg-background/95 backdrop-blur-sm ${className}`}
      data-testid={testId || 'resource-display-detailed'}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Light Points - Detailed */}
          <motion.div
            className="flex items-center gap-3"
            {...animationProps}
            key={`lp-detailed-${lp}`}
          >
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Light Points</p>
              <p className="text-xl font-bold combat-text-critical">
                {lp}
              </p>
            </div>
          </motion.div>
          
          {/* Shadow Points - Detailed */}
          <motion.div
            className="flex items-center gap-3"
            {...animationProps}
            key={`sp-detailed-${sp}`}
          >
            <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Shadow Points</p>
              <p className="text-xl font-bold combat-text-mana">
                {sp}
              </p>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResourceDisplay;

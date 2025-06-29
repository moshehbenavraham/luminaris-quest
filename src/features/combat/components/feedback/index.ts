import React from 'react';

// Feedback components for combat system
export { DamageIndicator } from './DamageIndicator';
export { CombatAnimation } from './CombatAnimation';
export { StatusNotification } from './StatusNotification';
export { TherapeuticInsight } from './TherapeuticInsight';
export { CombatLog, type CombatLogEntry } from './CombatLog';

// Lazy-loaded exports for performance
export const LazyDamageIndicator = React.lazy(() => import('./DamageIndicator').then(m => ({ default: m.DamageIndicator })));
export const LazyCombatAnimation = React.lazy(() => import('./CombatAnimation').then(m => ({ default: m.CombatAnimation })));
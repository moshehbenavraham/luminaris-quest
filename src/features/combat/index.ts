 
/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

// Main component exports
export { CombatOverlay } from './components/CombatOverlay';
export { CombatBackdrop } from './components/CombatBackdrop';
export { CombatContainer } from './components/CombatContainer';

// Store exports
export { 
  useCombatStore as useCombatStoreBase,
  type CombatState,
  type CombatResources,
  type StatusEffects,
  type CombatLogEntry,
  type GameResources,
  type SyncValidation,
  type SyncTransaction,
  type SyncTransactionResult,
  generateSyncChecksum,
  validateSyncChecksum,
  createSyncTransaction,
  validateSyncTransaction
} from './store/combat-store';

// Hook exports
export { 
  useCombatStore,
  useCombatActive,
  useCombatEnemy,
  useCombatResources,
  useCombatFlags,
  useNewCombatUI
} from './hooks/useCombatStore';
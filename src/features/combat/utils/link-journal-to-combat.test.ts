/**
 * Link Journal to Combat History Test Suite
 *
 * Tests for the linkJournalToCombatHistory utility:
 * - Success case: Updates combat_history with journal_entry_id
 * - Not found case: Handles missing combat_history record
 * - Error handling: Graceful failure with error message
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { linkJournalToCombatHistory } from './link-journal-to-combat';

// Mock supabase
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: (data: unknown) => {
        mockUpdate(data);
        return {
          eq: (column: string, value: string) => {
            mockEq(column, value);
            return Promise.resolve({ error: null });
          },
        };
      },
    }),
  },
}));

describe('linkJournalToCombatHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should return error for missing combatHistoryId', async () => {
      const result = await linkJournalToCombatHistory('', 'journal-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing combat history ID or journal entry ID');
    });

    it('should return error for missing journalEntryId', async () => {
      const result = await linkJournalToCombatHistory('combat-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing combat history ID or journal entry ID');
    });

    it('should return error for both IDs missing', async () => {
      const result = await linkJournalToCombatHistory('', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing combat history ID or journal entry ID');
    });
  });

  describe('Success Case', () => {
    it('should successfully link journal entry to combat history', async () => {
      const combatHistoryId = 'combat-history-uuid-123';
      const journalEntryId = 'journal-entry-uuid-456';

      const result = await linkJournalToCombatHistory(combatHistoryId, journalEntryId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify update was called with correct data
      expect(mockUpdate).toHaveBeenCalledWith({ journal_entry_id: journalEntryId });
      expect(mockEq).toHaveBeenCalledWith('id', combatHistoryId);
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase error gracefully', async () => {
      // Override the mock for this test
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: () => ({
          eq: () =>
            Promise.resolve({
              error: { message: 'Foreign key constraint violated' },
            }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await linkJournalToCombatHistory('combat-123', 'journal-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Foreign key constraint violated');
    });

    it('should handle network exceptions gracefully', async () => {
      // Override the mock for this test
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: () => ({
          eq: () => Promise.reject(new Error('Network timeout')),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await linkJournalToCombatHistory('combat-123', 'journal-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
    });

    it('should handle unknown error type gracefully', async () => {
      // Override the mock for this test
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: () => ({
          eq: () => Promise.reject('Unknown error string'),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await linkJournalToCombatHistory('combat-123', 'journal-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('Return Type Verification', () => {
    it('should return LinkJournalToCombatResult with success true', async () => {
      const result = await linkJournalToCombatHistory('combat-123', 'journal-456');

      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('should return LinkJournalToCombatResult with error on failure', async () => {
      const result = await linkJournalToCombatHistory('', 'journal-456');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    });
  });
});

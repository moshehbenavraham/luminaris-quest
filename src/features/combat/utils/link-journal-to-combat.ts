/**
 * Link journal entries to combat history records
 *
 * This utility updates combat_history records with the journal_entry_id
 * after a combat reflection journal entry is created. This creates
 * a FK relationship between the therapeutic reflection and the combat it references.
 *
 * Error Handling: This is non-critical - if linking fails, the journal entry
 * is still saved. Errors are logged but not thrown to avoid blocking the user.
 */

import { supabase } from '@/integrations/supabase/client';

export interface LinkJournalToCombatResult {
  success: boolean;
  error?: string;
}

/**
 * Links a journal entry to its corresponding combat history record.
 *
 * @param combatHistoryId - The ID of the combat_history record to update
 * @param journalEntryId - The ID of the journal entry to link
 * @returns A result object indicating success or failure with error message
 */
export async function linkJournalToCombatHistory(
  combatHistoryId: string,
  journalEntryId: string,
): Promise<LinkJournalToCombatResult> {
  // Validate inputs
  if (!combatHistoryId || !journalEntryId) {
    console.warn('linkJournalToCombatHistory: Missing required IDs', {
      combatHistoryId,
      journalEntryId,
    });
    return {
      success: false,
      error: 'Missing combat history ID or journal entry ID',
    };
  }

  try {
    const { error } = await supabase
      .from('combat_history')
      .update({ journal_entry_id: journalEntryId })
      .eq('id', combatHistoryId);

    if (error) {
      console.error('Failed to link journal entry to combat history:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.debug('Successfully linked journal entry to combat history', {
      combatHistoryId,
      journalEntryId,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception linking journal entry to combat history:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { PendingMovement } from '../../features/ledger/data/localLedger';
import type { MovementSender } from '../../features/ledger/data/syncQueue';

/** The RPC confirms identical retries and rejects an operation ID collision. */
export function createLedgerSender(client: SupabaseClient, expectedOwnerId: string): MovementSender {
  return {
    async send(operation: PendingMovement): Promise<void> {
      const { error } = await client.rpc('submit_ledger_operation', {
        p_expected_owner: expectedOwnerId,
        p_operation_id: operation.operationId,
        p_movement_id: operation.movement.id,
        p_payload: operation.movement,
      });
      if (error) throw error;
    },
  };
}

import type { SupabaseClient } from '@supabase/supabase-js';
import { createLedgerSender } from '../src/infrastructure/supabase/ledgerSender';

const entry = { operationId: 'op1', movement: { id: 'm1', date: '2026-01-01', amountCents: 100, status: 'realized' as const, category: 'income' as const } };

test('sends a stable operation and movement to the RPC', async () => {
  const rpc = jest.fn().mockResolvedValue({ error: null });
  const sender = createLedgerSender({ rpc } as unknown as SupabaseClient);
  await sender.send(entry);
  expect(rpc).toHaveBeenCalledWith('submit_ledger_operation', { p_operation_id: 'op1', p_movement_id: 'm1', p_payload: entry.movement });
});

test('propagates remote errors so the queue cannot acknowledge them', async () => {
  const error = new Error('connection lost');
  const sender = createLedgerSender({ rpc: jest.fn().mockResolvedValue({ error }) } as unknown as SupabaseClient);
  await expect(sender.send(entry)).rejects.toBe(error);
});

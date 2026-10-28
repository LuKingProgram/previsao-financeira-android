import { synchronizePending } from '../src/features/ledger/data/syncQueue';
import type { PendingMovement } from '../src/features/ledger/data/localLedger';

const operation: PendingMovement = {
  operationId: 'operation-1',
  movement: { id: 'movement-1', date: '2026-01-01', amountCents: 1200, status: 'realized', category: 'income' },
};

test('keeps an operation pending when the connection fails', async () => {
  const queue = { pending: jest.fn().mockResolvedValue([operation]), acknowledge: jest.fn() };
  const sender = { send: jest.fn().mockRejectedValue(new Error('offline')) };
  await expect(synchronizePending(queue, sender)).rejects.toThrow('offline');
  expect(queue.acknowledge).not.toHaveBeenCalled();
});

test('acknowledges only after server confirmation', async () => {
  const order: string[] = [];
  const queue = { pending: jest.fn().mockResolvedValue([operation]), acknowledge: jest.fn(async () => { order.push('ack'); }) };
  const sender = { send: jest.fn(async () => { order.push('confirmed'); }) };
  await synchronizePending(queue, sender);
  expect(order).toEqual(['confirmed', 'ack']);
  expect(queue.acknowledge).toHaveBeenCalledWith('operation-1');
});


test('serializes concurrent attempts for the same queue', async () => {
  let finishSend!: () => void;
  const sendFinished = new Promise<void>((resolve) => { finishSend = resolve; });
  const queue = { pending: jest.fn().mockResolvedValue([operation]), acknowledge: jest.fn().mockResolvedValue(undefined) };
  const sender = { send: jest.fn().mockReturnValue(sendFinished) };
  const first = synchronizePending(queue, sender);
  const second = synchronizePending(queue, sender);
  await Promise.resolve();
  expect(queue.pending).toHaveBeenCalledTimes(1);
  expect(sender.send).toHaveBeenCalledTimes(1);
  finishSend();
  await Promise.all([first, second]);
  expect(queue.acknowledge).toHaveBeenCalledTimes(1);
});

test('retries after local acknowledgement fails without dropping the operation', async () => {
  const queue = { pending: jest.fn().mockResolvedValue([operation]), acknowledge: jest.fn().mockRejectedValueOnce(new Error('storage error')).mockResolvedValueOnce(undefined) };
  const sender = { send: jest.fn().mockResolvedValue(undefined) };
  await expect(synchronizePending(queue, sender)).rejects.toThrow('storage error');
  await synchronizePending(queue, sender);
  expect(sender.send).toHaveBeenCalledTimes(2);
  expect(sender.send).toHaveBeenNthCalledWith(1, operation);
  expect(sender.send).toHaveBeenNthCalledWith(2, operation);
});

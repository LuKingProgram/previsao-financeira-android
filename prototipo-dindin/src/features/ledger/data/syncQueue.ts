import type { PendingMovement } from './localLedger';

export interface PendingQueue {
  pending(): Promise<PendingMovement[]>;
  acknowledge(operationId: string): Promise<void>;
}

export interface MovementSender {
  /** Must be idempotent for operationId and reject conflicts. */
  send(operation: PendingMovement): Promise<void>;
}

const activeRuns = new WeakMap<PendingQueue, Promise<void>>();

/** Serialize a queue's sync attempts. An error leaves unconfirmed work pending. */
export function synchronizePending(queue: PendingQueue, sender: MovementSender): Promise<void> {
  const active = activeRuns.get(queue);
  if (active) return active;

  const run = (async () => {
    for (const operation of await queue.pending()) {
      await sender.send(operation);
      await queue.acknowledge(operation.operationId);
    }
  })();
  activeRuns.set(queue, run);
  void run.finally(() => { activeRuns.delete(queue); }).catch(() => undefined);
  return run;
}

import * as SQLite from 'expo-sqlite';
import type { FinancialMovement } from '../../metrics/domain/financialMetrics';

export interface PendingMovement {
  readonly operationId: string;
  readonly movement: FinancialMovement;
}

/** Stores the movement and its pending operation atomically. */
export class LocalLedger {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  async initialize(): Promise<void> {
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS ledger_movements (
        id TEXT PRIMARY KEY NOT NULL,
        payload TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS ledger_pending (
        operation_id TEXT PRIMARY KEY NOT NULL,
        movement_id TEXT NOT NULL,
        payload TEXT NOT NULL
      );
    `);
  }

  async save(movement: FinancialMovement, operationId: string): Promise<void> {
    await this.db.withExclusiveTransactionAsync(async (tx) => {
      const payload = JSON.stringify(movement);
      await tx.runAsync(
        'INSERT INTO ledger_movements (id, payload) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload',
        movement.id, payload,
      );
      await tx.runAsync(
        'INSERT INTO ledger_pending (operation_id, movement_id, payload) VALUES (?, ?, ?)',
        operationId, movement.id, payload,
      );
    });
  }

  async list(): Promise<FinancialMovement[]> {
    const rows = await this.db.getAllAsync<{ payload: string }>('SELECT payload FROM ledger_movements');
    return rows.map((row) => JSON.parse(row.payload) as FinancialMovement);
  }

  async pending(): Promise<PendingMovement[]> {
    const rows = await this.db.getAllAsync<{ operation_id: string; payload: string }>(
      'SELECT operation_id, payload FROM ledger_pending ORDER BY rowid',
    );
    return rows.map((row) => ({ operationId: row.operation_id, movement: JSON.parse(row.payload) as FinancialMovement }));
  }

  async acknowledge(operationId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM ledger_pending WHERE operation_id = ?', operationId);
  }
}

export async function openLocalLedger(): Promise<LocalLedger> {
  const db = await SQLite.openDatabaseAsync('dindin-ledger.db');
  const ledger = new LocalLedger(db);
  await ledger.initialize();
  return ledger;
}

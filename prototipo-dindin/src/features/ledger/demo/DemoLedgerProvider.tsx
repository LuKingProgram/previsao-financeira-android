import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';

import { Text, View } from 'react-native';
import { openLocalLedger, type LocalLedger } from '../data/localLedger';
import type { FinancialMovement } from '../../metrics/domain/financialMetrics';
import { getDaysInLocalMonth, getTodayInSaoPaulo } from '../../../shared/dates/localDate';

export type LedgerMovement = FinancialMovement;

interface DemoLedgerValue {
  readonly movements: readonly LedgerMovement[];
  readonly today: string;
  readonly addMovement: (movement: LedgerMovement) => Promise<void>;
  readonly isDemo: boolean;
}

const DemoLedgerContext = createContext<DemoLedgerValue | null>(null);

function dateInCurrentMonth(today: string, day: number): string {
  return `${today.slice(0, 7)}-${String(day).padStart(2, '0')}`;
}

export function createFictionalMovements(today: string): LedgerMovement[] {
  const todayDay = Number(today.slice(8, 10));
  const daysInMonth = getDaysInLocalMonth(Number(today.slice(0, 4)), Number(today.slice(5, 7)));
  const movements: LedgerMovement[] = [
    {
      id: 'demo-income',
      description: 'Renda mensal',
      date: dateInCurrentMonth(today, Math.min(5, todayDay)),
      amountCents: 650_000,
      status: 'realized',
      category: 'income',
    },
    {
      id: 'demo-home',
      description: 'Moradia',
      date: dateInCurrentMonth(today, Math.min(7, todayDay)),
      amountCents: 220_000,
      status: 'realized',
      category: 'fixedExpense',
    },
    {
      id: 'demo-daily',
      description: 'Mercado e refeições',
      date: dateInCurrentMonth(today, Math.min(12, todayDay)),
      amountCents: 90_000,
      status: 'realized',
      category: 'dailyExpense',
    },
    {
      id: 'demo-savings',
      description: 'Reserva mensal',
      date: dateInCurrentMonth(today, Math.min(15, todayDay)),
      amountCents: 60_000,
      status: 'realized',
      category: 'savings',
    },
    {
      id: 'demo-card',
      description: 'Compra no cartão',
      date: dateInCurrentMonth(today, Math.min(18, todayDay)),
      amountCents: 85_000,
      status: 'realized',
      category: 'cardExpense',
    },
  ];

  if (todayDay < daysInMonth) {
    movements.push({
      id: 'demo-forecast',
      description: 'Previsão de gastos diários',
      date: dateInCurrentMonth(today, daysInMonth),
      amountCents: 40_000,
      status: 'planned',
      category: 'dailyForecast',
    });
  }

  return movements;
}

export function DemoLedgerProvider({ children }: PropsWithChildren) {
  const [today] = useState(getTodayInSaoPaulo);
  const [movements, setMovements] = useState<LedgerMovement[]>(() =>
    createFictionalMovements(today),
  );

  const addMovement = useCallback(async (movement: LedgerMovement) => {
    setMovements((current) => [movement, ...current]);
  }, []);

  const value = useMemo(
    () => ({ movements, today, addMovement, isDemo: true }),
    [movements, today, addMovement],
  );

  return <DemoLedgerContext.Provider value={value}>{children}</DemoLedgerContext.Provider>;
}

export function PersistentLedgerProvider({ children }: PropsWithChildren) {
  const [today] = useState(getTodayInSaoPaulo);
  const [movements, setMovements] = useState<LedgerMovement[]>([]);
  const [ledger, setLedger] = useState<LocalLedger | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void openLocalLedger().then(async (store) => {
      const saved = await store.list();
      if (active) { setMovements(saved); setLedger(store); }
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  const addMovement = useCallback(async (movement: LedgerMovement) => {
    if (!ledger) throw new Error('Local storage is unavailable');
    await ledger.save(movement, movement.id);
    setMovements((current) => [movement, ...current]);
  }, [ledger]);
  const value = useMemo(() => ({ movements, today, addMovement, isDemo: false }), [movements, today, addMovement]);
  if (!ledger) return <View><Text>{failed ? 'Não foi possível abrir os dados locais. Feche e tente novamente.' : 'Abrindo dados locais…'}</Text></View>;
  return <DemoLedgerContext.Provider value={value}>{children}</DemoLedgerContext.Provider>;
}

export function useDemoLedger(): DemoLedgerValue {
  const value = useContext(DemoLedgerContext);
  if (!value) throw new Error('useDemoLedger must be used within DemoLedgerProvider.');
  return value;
}

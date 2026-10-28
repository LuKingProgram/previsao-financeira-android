import { useLocalSearchParams, useRouter } from 'expo-router';

import { MovementListScreen } from '../features/ledger/ui/MovementListScreen';
import type { FinancialMetricKey } from '../features/metrics/domain/financialMetrics';

function readNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function readMetric(value: string | string[] | undefined): FinancialMetricKey | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === 'performance' ||
    raw === 'costOfLiving' ||
    raw === 'dailyAverage' ||
    raw === 'savings'
  ) {
    return raw;
  }
  return undefined;
}

export default function MovementsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    year?: string | string[];
    month?: string | string[];
    metric?: string | string[];
    scope?: string | string[];
  }>();
  const year = readNumber(params.year);
  const month = readNumber(params.month);
  const period =
    year !== undefined && month !== undefined && month >= 1 && month <= 12
      ? { year, month }
      : undefined;
  const rawScope = Array.isArray(params.scope) ? params.scope[0] : params.scope;
  const scope = rawScope === 'year' || rawScope === 'month' ? rawScope : undefined;

  return (
    <MovementListScreen
      period={period}
      metric={readMetric(params.metric)}
      scope={scope}
      onBackToSummary={() => router.replace('/')}
      onAdd={() => router.push('/new-movement')}
      onSettings={() => router.push('/settings')}
    />
  );
}

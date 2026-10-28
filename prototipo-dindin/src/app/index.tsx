import { useRouter } from 'expo-router';

import { MonthlySummaryScreen } from '../features/metrics/ui/MonthlySummaryScreen';

export default function HomeRoute() {
  const router = useRouter();

  return (
    <MonthlySummaryScreen
      onOpenMetric={(request) =>
        router.push({
          pathname: '/movements',
          params: {
            year: String(request.year),
            month: String(request.month),
            metric: request.metric,
          },
        })
      }
      onOpenPeriod={(period) =>
        router.push({
          pathname: '/movements',
          params: {
            year: String(period.year),
            month: String(period.month),
            scope: period.scope,
          },
        })
      }
      onAdd={() => router.push('/new-movement')}
      onShowMovements={() => router.push('/movements')}
      onSettings={() => router.push('/settings')}
    />
  );
}

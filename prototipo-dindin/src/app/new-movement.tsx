import { useRouter } from 'expo-router';

import { NewMovementScreen } from '../features/ledger/ui/NewMovementScreen';

export default function NewMovementRoute() {
  const router = useRouter();

  return (
    <NewMovementScreen
      onBack={() => router.back()}
      onSaved={() => router.replace('/movements')}
    />
  );
}

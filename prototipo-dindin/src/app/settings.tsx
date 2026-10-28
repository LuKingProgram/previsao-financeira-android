import { useRouter } from 'expo-router';

import { SettingsScreen } from '../features/settings/ui/SettingsScreen';

export default function SettingsRoute() {
  const router = useRouter();

  return (
    <SettingsScreen
      onBackToSummary={() => router.replace('/')}
      onShowMovements={() => router.push('/movements')}
      onAdd={() => router.push('/new-movement')}
    />
  );
}

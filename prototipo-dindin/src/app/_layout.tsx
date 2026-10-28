import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PersistentLedgerProvider } from '../features/ledger/demo/DemoLedgerProvider';
import { AppThemeProvider, useAppTheme } from '../shared/theme/AppThemeProvider';

function AppStack() {
  const { mode } = useAppTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="movements" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="new-movement" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <PersistentLedgerProvider>
        <AppStack />
      </PersistentLedgerProvider>
    </AppThemeProvider>
  );
}

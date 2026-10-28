import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Button, Text } from 'react-native';
import { PersistentLedgerProvider, useDemoLedger } from '../src/features/ledger/demo/DemoLedgerProvider';
import { openLocalLedger } from '../src/features/ledger/data/localLedger';

jest.mock('../src/features/ledger/data/localLedger', () => ({ openLocalLedger: jest.fn() }));
const entry = { id: 'one', date: '2026-01-01', amountCents: 100, status: 'realized' as const, category: 'income' as const };
function Screen() {
  const { movements, addMovement } = useDemoLedger();
  return <><Text testID="count">{movements.length}</Text><Button title="Save" onPress={() => void addMovement(entry)} /></>;
}

test('restores saved movements when the provider reopens', async () => {
  const persisted: typeof entry[] = [];
  const store = { list: jest.fn(async () => [...persisted]), save: jest.fn(async (movement: typeof entry) => { persisted.push(movement); }) };
  jest.mocked(openLocalLedger).mockResolvedValue(store as never);
  const first = await render(<PersistentLedgerProvider><Screen /></PersistentLedgerProvider>);
  await waitFor(() => expect(first.getByTestId('count').props.children).toBe(0));
  await fireEvent.press(first.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(first.getByTestId('count').props.children).toBe(1));
  await first.unmount();
  const reopened = await render(<PersistentLedgerProvider><Screen /></PersistentLedgerProvider>);
  await waitFor(() => expect(reopened.getByTestId('count').props.children).toBe(1));
  await reopened.unmount();
});

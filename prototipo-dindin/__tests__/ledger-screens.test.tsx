import { fireEvent, render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import {
  DemoLedgerProvider,
  useDemoLedger,
} from '../src/features/ledger/demo/DemoLedgerProvider';
import { MovementListScreen } from '../src/features/ledger/ui/MovementListScreen';
import { NewMovementScreen } from '../src/features/ledger/ui/NewMovementScreen';
import { AppThemeProvider } from '../src/shared/theme/AppThemeProvider';
import {
  formatBrazilianDate,
  getDaysInLocalMonth,
  getTodayInSaoPaulo,
  shiftYearMonth,
} from '../src/shared/dates/localDate';

function LedgerCount() {
  const { movements } = useDemoLedger();
  return <Text testID="movement-count">{movements.length}</Text>;
}

async function renderDemo(children: ReactNode) {
  return render(
    <AppThemeProvider>
      <DemoLedgerProvider>{children}</DemoLedgerProvider>
    </AppThemeProvider>,
  );
}

describe('demo movement screens', () => {
  it('limits a metric list to the exact source movements', async () => {
    const today = getTodayInSaoPaulo();
    const view = await renderDemo(
      <MovementListScreen
        period={{ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }}
        metric="costOfLiving"
        onBackToSummary={jest.fn()}
        onAdd={jest.fn()}
        onSettings={jest.fn()}
      />,
    );

    expect(view.getByText('Mercado e refeições')).toBeTruthy();
    expect(view.getByText('Compra no cartão')).toBeTruthy();
    expect(view.queryByText('Renda mensal')).toBeNull();
    expect(view.queryByText('Reserva mensal')).toBeNull();
    await view.unmount();
  });

  it('adds a manual movement to session-only demo state', async () => {
    const onSaved = jest.fn();
    const view = await renderDemo(
      <>
        <NewMovementScreen onBack={jest.fn()} onSaved={onSaved} />
        <LedgerCount />
      </>,
    );
    const initialCount = Number(view.getByTestId('movement-count').props.children);

    await fireEvent.changeText(view.getByLabelText('Valor'), 'R$ 12,34');
    await fireEvent.changeText(view.getByLabelText('Data'), formatBrazilianDate(getTodayInSaoPaulo()));
    await fireEvent.changeText(view.getByLabelText('Descrição'), 'Café');
    await fireEvent.press(view.getByRole('button', { name: 'Gasto diário' }));
    await fireEvent.press(view.getByRole('button', { name: 'Salvar movimento' }));

    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(Number(view.getByTestId('movement-count').props.children)).toBe(initialCount + 1);
    expect(view.getByRole('button', { name: 'Realizado' }).props.accessibilityState?.selected).toBe(true);
    await view.unmount();
  });

  it('suggests planned status for future dates and allows a manual override', async () => {
    const today = getTodayInSaoPaulo();
    const view = await renderDemo(
      <NewMovementScreen onBack={jest.fn()} onSaved={jest.fn()} />,
    );
    const [year, month, day] = today.split('-').map(Number);
    const lastDay = getDaysInLocalMonth(year!, month!);
    const nextPeriod = day! < lastDay ? { year: year!, month: month! } : shiftYearMonth({ year: year!, month: month! }, 1);
    const futureDay = day! < lastDay ? day! + 1 : 1;
    const future = `${String(futureDay).padStart(2, '0')}/${String(nextPeriod.month).padStart(2, '0')}/${nextPeriod.year}`;

    await fireEvent.changeText(view.getByLabelText('Data'), future);
    expect(view.getByRole('button', { name: 'Previsto' }).props.accessibilityState?.selected).toBe(true);

    await fireEvent.press(view.getByRole('button', { name: 'Realizado' }));
    expect(view.getByRole('button', { name: 'Realizado' }).props.accessibilityState?.selected).toBe(true);
    await view.unmount();
  });

  it('keeps a daily-forecast movement planned', async () => {
    const view = await renderDemo(
      <NewMovementScreen onBack={jest.fn()} onSaved={jest.fn()} />,
    );

    await fireEvent.press(view.getByRole('button', { name: 'Previsão diária' }));

    expect(view.getByRole('button', { name: 'Previsto' }).props.accessibilityState?.selected).toBe(true);
    await fireEvent.press(view.getByRole('button', { name: 'Realizado' }));
    expect(view.getByRole('button', { name: 'Previsto' }).props.accessibilityState?.selected).toBe(true);
    expect(
      view.getByText(/para registrar o gasto realizado, use “Gasto diário”/i),
    ).toBeTruthy();
    await view.unmount();
  });
});

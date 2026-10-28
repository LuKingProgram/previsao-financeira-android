import { render } from '@testing-library/react-native';

import { MonthlySummaryScreen } from '../src/features/metrics/ui/MonthlySummaryScreen';
import { DemoLedgerProvider } from '../src/features/ledger/demo/DemoLedgerProvider';
import { AppThemeProvider } from '../src/shared/theme/AppThemeProvider';

describe('monthly summary screen', () => {
  it('shows the fictitious demo summary and approved metrics', async () => {
    const view = await render(
      <AppThemeProvider>
        <DemoLedgerProvider>
          <MonthlySummaryScreen
            onOpenMetric={jest.fn()}
            onOpenPeriod={jest.fn()}
            onAdd={jest.fn()}
            onShowMovements={jest.fn()}
            onSettings={jest.fn()}
          />
        </DemoLedgerProvider>
      </AppThemeProvider>,
    );

    expect(view.getByText('Din Din')).toBeTruthy();
    expect(view.getByText('Demonstração')).toBeTruthy();
    expect(view.getByText('Performance do mês')).toBeTruthy();
    expect(view.getByText('Custo de vida')).toBeTruthy();
    expect(view.getByText('Diário médio')).toBeTruthy();
    await view.unmount();
  });
});

import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';

import { calculateAnnualSavingsMetrics } from '../src/features/metrics/domain/financialMetrics';
import { SavingsProgressSection } from '../src/features/metrics/ui/SavingsProgressSection';
import { AppThemeProvider } from '../src/shared/theme/AppThemeProvider';

describe('SavingsProgressSection', () => {
  it('shows annual and monthly realized/projected savings rates', async () => {
    const summary = calculateAnnualSavingsMetrics(
      [
        {
          id: 'income',
          category: 'income',
          amountCents: 200_000,
          status: 'realized',
          date: '2026-01-10',
        },
        {
          id: 'savings',
          category: 'savings',
          amountCents: 40_000,
          status: 'realized',
          date: '2026-01-11',
        },
        {
          id: 'planned-income',
          category: 'income',
          amountCents: 100_000,
          status: 'planned',
          date: '2026-01-12',
        },
        {
          id: 'planned-savings',
          category: 'savings',
          amountCents: 50_000,
          status: 'planned',
          date: '2026-01-13',
        },
      ],
      2026,
    );
    const view = await render(
      <AppThemeProvider>
        <SavingsProgressSection
          summary={summary}
          selectedMonth={1}
          onChangeMonth={jest.fn()}
          onChangeYear={jest.fn()}
          onSelectMonth={jest.fn()}
        />
      </AppThemeProvider>,
    );

    expect(view.getByText('Total do ano')).toBeTruthy();
    expect(view.getAllByText('Janeiro').length).toBeGreaterThan(0);
    expect(view.queryByText('Fevereiro')).toBeNull();
    expect(view.getAllByText('20%').length).toBeGreaterThan(0);
    expect(view.getAllByText('30%').length).toBeGreaterThan(0);
    expect(view.getAllByText('Economias realizadas').length).toBeGreaterThan(0);
    expect(view.getAllByText('Economias projetadas').length).toBeGreaterThan(0);
    await view.unmount();
  });

  it('changes years and opens the selected month movements', async () => {
    const onChangeYear = jest.fn();
    const onSelectYear = jest.fn();
    const onSelectMonth = jest.fn();
    const summary = calculateAnnualSavingsMetrics([], 2026);
    const view = await render(
      <AppThemeProvider>
        <SavingsProgressSection
          summary={summary}
          selectedMonth={1}
          onChangeMonth={jest.fn()}
          onChangeYear={onChangeYear}
          onSelectYear={onSelectYear}
          onSelectMonth={onSelectMonth}
        />
      </AppThemeProvider>,
    );

    await fireEvent.press(view.getByRole('button', { name: 'Ano anterior' }));
    expect(onChangeYear).toHaveBeenCalledWith(2025);

    await fireEvent.press(
      view.getByRole('button', { name: 'Total do ano, abrir lançamentos do período' }),
    );
    expect(onSelectYear).toHaveBeenCalledWith(2026);

    await fireEvent.press(
      view.getByRole('button', { name: 'Abrir lançamentos de Janeiro de 2026' }),
    );
    expect(onSelectMonth).toHaveBeenCalledWith(1);
    await view.unmount();
  });

  it('shows an unavailable rate when the period has no income', async () => {
    const summary = calculateAnnualSavingsMetrics([], 2026);
    const view = await render(
      <AppThemeProvider>
        <SavingsProgressSection
          summary={summary}
          selectedMonth={1}
          onChangeMonth={jest.fn()}
          onChangeYear={jest.fn()}
          onSelectMonth={jest.fn()}
        />
      </AppThemeProvider>,
    );

    expect((await view.findAllByText('Sem entradas')).length).toBeGreaterThan(0);
    await view.unmount();
  });

  it('shows only the chosen month and opens its movements', async () => {
    const open = jest.fn();
    const summary = calculateAnnualSavingsMetrics([], 2026);
    function Harness() {
      const [month, setMonth] = useState(1);
      return <SavingsProgressSection summary={summary} selectedMonth={month} onChangeMonth={setMonth} onChangeYear={jest.fn()} onSelectMonth={open} />;
    }
    const view = await render(<AppThemeProvider><Harness /></AppThemeProvider>);
    expect(view.queryByText('Fevereiro')).toBeNull();
    await fireEvent.press(view.getByRole('button', { name: 'Próximo mês das economias' }));
    expect(view.queryByText('Janeiro')).toBeNull();
    expect(view.getAllByText('Fevereiro').length).toBeGreaterThan(0);
    await fireEvent.press(view.getByRole('button', { name: 'Abrir lançamentos de Fevereiro de 2026' }));
    expect(open).toHaveBeenCalledWith(2);
    await view.unmount();
  });

});

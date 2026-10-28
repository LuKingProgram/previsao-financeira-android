import {
  calculateAnnualSavingsMetrics,
  calculateFinancialMetrics,
  type FinancialMovement,
} from '../src/features/metrics/domain/financialMetrics';

function movement(
  id: string,
  category: FinancialMovement['category'],
  amountCents: number,
  status: FinancialMovement['status'] = 'realized',
  date = '2026-10-10',
): FinancialMovement {
  return { id, category, amountCents, status, date };
}

describe('calculateFinancialMetrics', () => {
  it('returns realized and projected performance and cost of living separately', () => {
    const metrics = calculateFinancialMetrics(
      [
        movement('salary', 'income', 500_000),
        movement('rent', 'fixedExpense', 150_000),
        movement('groceries', 'dailyExpense', 50_000),
        movement('saved', 'savings', 100_000),
        movement('card', 'cardExpense', 25_000),
        movement('planned-income', 'income', 30_000, 'planned'),
        movement('planned-daily', 'dailyForecast', 15_000, 'planned'),
        movement('cancelled', 'dailyExpense', 900_000, 'cancelled'),
        movement('outside-period', 'fixedExpense', 999_999, 'realized', '2026-11-01'),
      ],
      { year: 2026, month: 10 },
    );

    expect(metrics.performance).toEqual({
      realizedCents: 175_000,
      plannedCents: 15_000,
      projectedCents: 190_000,
      realizedMovementIds: ['card', 'groceries', 'rent', 'salary', 'saved'],
      plannedMovementIds: ['planned-daily', 'planned-income'],
    });
    expect(metrics.costOfLiving).toEqual({
      realizedCents: 225_000,
      plannedCents: 15_000,
      projectedCents: 240_000,
      realizedMovementIds: ['card', 'groceries', 'rent'],
      plannedMovementIds: ['planned-daily'],
    });
    expect(metrics.savings.realizedRatePercent).toBe(20);
    expect(metrics.savings.projectedRatePercent).toBeCloseTo(18.87);
  });

  it('excludes planned costs and savings from the realized daily average', () => {
    const metrics = calculateFinancialMetrics(
      [
        movement('daily-a', 'dailyExpense', 1_000, 'realized', '2026-02-10'),
        movement('daily-b', 'dailyExpense', 2_000, 'realized', '2026-02-11'),
        movement('planned-daily', 'dailyExpense', 100_000, 'planned', '2026-02-12'),
        movement('forecast', 'dailyForecast', 100_000, 'realized', '2026-02-13'),
        movement('fixed', 'fixedExpense', 100_000, 'realized', '2026-02-14'),
      ],
      { year: 2026, month: 2 },
    );

    expect(metrics.dailyAverage).toEqual({
      averageCents: 107,
      daysInMonth: 28,
      realizedMovementIds: ['daily-a', 'daily-b'],
    });
  });

  it('uses leap-year month length and rounds the average to cents', () => {
    const metrics = calculateFinancialMetrics(
      [movement('daily', 'dailyExpense', 1_000, 'realized', '2024-02-10')],
      { year: 2024, month: 2 },
    );

    expect(metrics.dailyAverage).toEqual({
      averageCents: 34,
      daysInMonth: 29,
      realizedMovementIds: ['daily'],
    });
  });

  it('returns a null savings rate when there is no income', () => {
    const metrics = calculateFinancialMetrics(
      [movement('saving', 'savings', 1_000)],
      { year: 2026, month: 10 },
    );

    expect(metrics.savings.realizedRatePercent).toBeNull();
    expect(metrics.savings.projectedRatePercent).toBeNull();
  });

  it('returns zero totals for an empty period and allows a negative performance result', () => {
    const empty = calculateFinancialMetrics([], { year: 2026, month: 10 });
    const negative = calculateFinancialMetrics(
      [
        movement('income', 'income', 1_000),
        movement('expense', 'fixedExpense', 2_000),
      ],
      { year: 2026, month: 10 },
    );

    expect(empty.performance.realizedCents).toBe(0);
    expect(empty.costOfLiving.realizedCents).toBe(0);
    expect(empty.dailyAverage.averageCents).toBe(0);
    expect(negative.performance.realizedCents).toBe(-1_000);
  });

  it('tracks movement ids by metric so the UI can open the included movements', () => {
    const metrics = calculateFinancialMetrics(
      [
        movement('income', 'income', 10_000),
        movement('life', 'dailyExpense', 2_000),
        movement('saving', 'savings', 1_000),
        movement('future', 'dailyForecast', 500, 'planned'),
      ],
      { year: 2026, month: 10 },
    );

    expect(metrics.performance.realizedMovementIds).toEqual([
      'income',
      'life',
      'saving',
    ]);
    expect(metrics.performance.plannedMovementIds).toEqual(['future']);
    expect(metrics.costOfLiving.realizedMovementIds).toEqual(['life']);
    expect(metrics.dailyAverage.realizedMovementIds).toEqual(['life']);
    expect(metrics.savings.amount.realizedMovementIds).toEqual(['saving']);
    expect(metrics.savings.income.realizedMovementIds).toEqual(['income']);
  });

  it('throws when the input contains an invalid date, amount, or duplicate id', () => {
    expect(() =>
      calculateFinancialMetrics(
        [movement('bad-date', 'income', 1, 'realized', '2026-02-30')],
        { year: 2026, month: 2 },
      ),
    ).toThrow(RangeError);

    expect(() =>
      calculateFinancialMetrics(
        [movement('bad-amount', 'income', 1.5)],
        { year: 2026, month: 10 },
      ),
    ).toThrow(RangeError);

    expect(() =>
      calculateFinancialMetrics(
        [
          movement('duplicate', 'income', 100),
          movement('duplicate', 'dailyExpense', 100),
        ],
        { year: 2026, month: 10 },
      ),
    ).toThrow(RangeError);
  });

  it('throws instead of returning an imprecise total when cents overflow', () => {
    expect(() =>
      calculateFinancialMetrics(
        [
          movement('first', 'income', Number.MAX_SAFE_INTEGER),
          movement('second', 'income', 1),
        ],
        { year: 2026, month: 10 },
      ),
    ).toThrow(RangeError);
  });
});

describe('calculateAnnualSavingsMetrics', () => {
  it('calculates the annual rate from total amounts and returns each month', () => {
    const annual = calculateAnnualSavingsMetrics(
      [
        movement('income-jan', 'income', 100_000, 'realized', '2026-01-10'),
        movement('saving-jan', 'savings', 50_000, 'realized', '2026-01-11'),
        movement('income-feb', 'income', 900_000, 'realized', '2026-02-10'),
        movement('saving-feb', 'savings', 90_000, 'realized', '2026-02-11'),
        movement('prior-year-income', 'income', 900_000, 'realized', '2025-12-10'),
        movement('next-year-income', 'income', 900_000, 'realized', '2027-01-10'),
      ],
      2026,
    );

    expect(annual.savings.realizedRatePercent).toBe(14);
    expect(annual.months).toHaveLength(12);
    expect(annual.months[0]?.savings.realizedRatePercent).toBe(50);
    expect(annual.months[1]?.savings.realizedRatePercent).toBe(10);
    expect(annual.months[2]?.savings.realizedRatePercent).toBeNull();
  });

  it('includes planned income and savings only in the projected annual rate', () => {
    const annual = calculateAnnualSavingsMetrics(
      [
        movement('income-realized', 'income', 100_000, 'realized', '2026-01-10'),
        movement('saving-realized', 'savings', 10_000, 'realized', '2026-01-11'),
        movement('income-planned', 'income', 100_000, 'planned', '2026-02-10'),
        movement('saving-planned', 'savings', 30_000, 'planned', '2026-02-11'),
      ],
      2026,
    );

    expect(annual.savings.realizedRatePercent).toBe(10);
    expect(annual.savings.projectedRatePercent).toBe(20);
  });
});

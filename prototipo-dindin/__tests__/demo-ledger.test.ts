import { createFictionalMovements } from '../src/features/ledger/demo/DemoLedgerProvider';

describe('fictional demo ledger', () => {
  it('does not mark future dated sample movements as realized', () => {
    const movements = createFictionalMovements('2026-02-01');

    expect(
      movements
        .filter((movement) => movement.status === 'realized')
        .every((movement) => movement.date <= '2026-02-01'),
    ).toBe(true);
    expect(movements.find((movement) => movement.id === 'demo-forecast')).toMatchObject({
      date: '2026-02-28',
      status: 'planned',
    });
  });

  it('omits the future forecast when the current day is the last day of the month', () => {
    const movements = createFictionalMovements('2026-02-28');

    expect(movements.some((movement) => movement.category === 'dailyForecast')).toBe(false);
  });
});

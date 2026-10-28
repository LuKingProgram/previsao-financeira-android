import { parseBrazilianAmountToCents } from '../src/features/ledger/domain/movementInput';
import {
  formatBrazilianDate,
  getDaysInLocalMonth,
  getTodayInSaoPaulo,
  parseBrazilianDate,
  shiftYearMonth,
} from '../src/shared/dates/localDate';

describe('Brazilian movement input', () => {
  it.each([
    ['R$ 1.234,56', 123_456],
    ['1234,5', 123_450],
    ['1234.56', 123_456],
    ['1.234', 123_400],
    ['0,01', 1],
  ])('parses %s as integer cents', (input, expected) => {
    expect(parseBrazilianAmountToCents(input)).toBe(expected);
  });

  it.each(['', '12,345', '1.23.4', '-10,00', 'R$ xx', '90071992547409,92'])(
    'rejects invalid amount %s',
    (input) => {
      expect(parseBrazilianAmountToCents(input)).toBeNull();
    },
  );

  it('parses and formats local calendar dates without timezone conversion', () => {
    expect(parseBrazilianDate('29/02/2024')).toBe('2024-02-29');
    expect(parseBrazilianDate('29/02/2025')).toBeNull();
    expect(parseBrazilianDate('31/04/2026')).toBeNull();
    expect(formatBrazilianDate('2026-10-28')).toBe('28/10/2026');
  });

  it('handles the Sao Paulo day boundary, leap months, and month navigation', () => {
    expect(getTodayInSaoPaulo(new Date('2026-10-29T01:00:00.000Z'))).toBe('2026-10-28');
    expect(getDaysInLocalMonth(2024, 2)).toBe(29);
    expect(getDaysInLocalMonth(2025, 2)).toBe(28);
    expect(shiftYearMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftYearMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
  });
});

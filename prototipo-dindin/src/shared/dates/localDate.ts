export interface LocalDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export interface YearMonth {
  readonly year: number;
  readonly month: number;
}

export function isValidLocalDateParts({ year, month, day }: LocalDateParts): boolean {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(day) ||
    day < 1
  ) {
    return false;
  }

  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days =
    month === 2
      ? leap
        ? 29
        : 28
      : [4, 6, 9, 11].includes(month)
        ? 30
        : 31;

  return day <= days;
}

export function parseBrazilianDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!isValidLocalDateParts({ year, month, day })) return null;

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatBrazilianDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function getDaysInLocalMonth(year: number, month: number): number {
  if (!Number.isInteger(year) || year < 1 || year > 9999 || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('A valid year and month are required.');
  }

  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  if (month === 2) return leap ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function getYearMonthFromLocalDate(isoDate: string): YearMonth | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidLocalDateParts({ year, month, day })) return null;
  return { year, month };
}

export function shiftYearMonth(period: YearMonth, amount: number): YearMonth {
  if (!Number.isInteger(amount)) throw new RangeError('Month shift must be an integer.');
  const absoluteMonth = period.year * 12 + (period.month - 1) + amount;
  const year = Math.floor(absoluteMonth / 12);
  const month = (absoluteMonth % 12) + 1;
  if (year < 1 || year > 9999) throw new RangeError('Month shift exceeds the supported calendar.');
  return { year, month };
}

export function getTodayInSaoPaulo(now = new Date()): string {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value ?? '';

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

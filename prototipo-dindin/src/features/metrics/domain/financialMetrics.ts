export type MovementStatus = 'realized' | 'planned' | 'cancelled';

export type MovementCategory =
  | 'income'
  | 'fixedExpense'
  | 'dailyExpense'
  | 'savings'
  | 'cardExpense'
  | 'dailyForecast';

export interface FinancialMovement {
  readonly id: string;
  readonly description?: string;
  /** Local calendar date in YYYY-MM-DD format. */
  readonly date: string;
  /** Non-negative amount in integer cents. */
  readonly amountCents: number;
  readonly status: MovementStatus;
  readonly category: MovementCategory;
}

export interface FinancialPeriod {
  readonly year: number;
  /** Calendar month from 1 to 12. */
  readonly month: number;
}

export type FinancialMetricKey =
  | 'performance'
  | 'costOfLiving'
  | 'dailyAverage'
  | 'savings';

export interface MetricAmount {
  readonly realizedCents: number;
  /** The signed contribution of planned movements to this metric. */
  readonly plannedCents: number;
  /** Realized amount plus the planned contribution. */
  readonly projectedCents: number;
  readonly realizedMovementIds: readonly string[];
  readonly plannedMovementIds: readonly string[];
}

export interface SavingsMetrics {
  readonly amount: MetricAmount;
  readonly income: MetricAmount;
  /** Percentage rounded to two decimal places; null when there is no income. */
  readonly realizedRatePercent: number | null;
  /** Percentage from realized plus planned savings and income; null at zero income. */
  readonly projectedRatePercent: number | null;
}

export interface FinancialMetrics {
  readonly period: FinancialPeriod;
  /** Income minus all expenses, including explicit savings movements. */
  readonly performance: MetricAmount;
  /** Living expenses, excluding explicit savings movements. */
  readonly costOfLiving: MetricAmount;
  readonly dailyAverage: {
    /** Mean realized daily-expense amount, rounded to the nearest cent. */
    readonly averageCents: number;
    readonly daysInMonth: number;
    readonly realizedMovementIds: readonly string[];
  };
  readonly savings: SavingsMetrics;
}

export interface MonthlySavingsMetrics {
  readonly month: number;
  readonly savings: SavingsMetrics;
}

export interface AnnualSavingsMetrics {
  readonly year: number;
  readonly savings: SavingsMetrics;
  readonly months: readonly MonthlySavingsMetrics[];
}

interface MutableMetricAmount {
  realizedCents: number;
  plannedCents: number;
  realizedMovementIds: string[];
  plannedMovementIds: string[];
}

const VALID_STATUSES = new Set<MovementStatus>([
  'realized',
  'planned',
  'cancelled',
]);

const VALID_CATEGORIES = new Set<MovementCategory>([
  'income',
  'fixedExpense',
  'dailyExpense',
  'savings',
  'cardExpense',
  'dailyForecast',
]);

function assertValidPeriod(period: FinancialPeriod): void {
  if (
    !Number.isInteger(period.year) ||
    period.year < 1 ||
    period.year > 9999 ||
    !Number.isInteger(period.month) ||
    period.month < 1 ||
    period.month > 12
  ) {
    throw new RangeError('Period must contain a valid year and month.');
  }
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isValidLocalDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= getDaysInMonth(year, month)
  );
}

function assertValidMovement(movement: FinancialMovement): void {
  if (movement.id.trim().length === 0) {
    throw new RangeError('Each movement must have a non-empty id.');
  }
  if (!isValidLocalDate(movement.date)) {
    throw new RangeError(`Movement ${movement.id} must have a valid local date.`);
  }
  if (
    !Number.isSafeInteger(movement.amountCents) ||
    movement.amountCents < 0
  ) {
    throw new RangeError(
      `Movement ${movement.id} must have a non-negative safe integer amount in cents.`,
    );
  }
  if (!VALID_STATUSES.has(movement.status)) {
    throw new RangeError(`Movement ${movement.id} has an unknown status.`);
  }
  if (!VALID_CATEGORIES.has(movement.category)) {
    throw new RangeError(`Movement ${movement.id} has an unknown category.`);
  }
}

function addCents(current: number, amount: number): number {
  const total = current + amount;
  if (!Number.isSafeInteger(total)) {
    throw new RangeError('Metric total exceeds safe integer precision.');
  }
  return total;
}

function createMutableMetricAmount(): MutableMetricAmount {
  return {
    realizedCents: 0,
    plannedCents: 0,
    realizedMovementIds: [],
    plannedMovementIds: [],
  };
}

function addMovement(
  target: MutableMetricAmount,
  movement: FinancialMovement,
  sign = 1,
): void {
  const signedCents = movement.amountCents * sign;

  if (movement.status === 'realized') {
    target.realizedCents = addCents(target.realizedCents, signedCents);
    target.realizedMovementIds.push(movement.id);
  } else if (movement.status === 'planned') {
    target.plannedCents = addCents(target.plannedCents, signedCents);
    target.plannedMovementIds.push(movement.id);
  }
}

function toMetricAmount(value: MutableMetricAmount): MetricAmount {
  return {
    realizedCents: value.realizedCents,
    plannedCents: value.plannedCents,
    projectedCents: addCents(value.realizedCents, value.plannedCents),
    realizedMovementIds: [...value.realizedMovementIds].sort(),
    plannedMovementIds: [...value.plannedMovementIds].sort(),
  };
}

function calculateRatePercent(savingsCents: number, incomeCents: number): number | null {
  if (incomeCents === 0) return null;
  return Math.round((savingsCents / incomeCents) * 10_000) / 100;
}

function buildSavingsMetrics(
  amount: MetricAmount,
  income: MetricAmount,
): SavingsMetrics {
  return {
    amount,
    income,
    realizedRatePercent: calculateRatePercent(
      amount.realizedCents,
      income.realizedCents,
    ),
    projectedRatePercent: calculateRatePercent(
      amount.projectedCents,
      income.projectedCents,
    ),
  };
}

function dateMatchesPeriod(date: string, period: FinancialPeriod): boolean {
  const monthPrefix = `${String(period.year).padStart(4, '0')}-${String(
    period.month,
  ).padStart(2, '0')}-`;
  return date.startsWith(monthPrefix);
}

export function calculateFinancialMetrics(
  movements: readonly FinancialMovement[],
  period: FinancialPeriod,
): FinancialMetrics {
  assertValidPeriod(period);

  const performance = createMutableMetricAmount();
  const costOfLiving = createMutableMetricAmount();
  const savings = createMutableMetricAmount();
  const income = createMutableMetricAmount();
  const dailyMovementIds: string[] = [];
  let realizedDailyCents = 0;
  const seenIds = new Set<string>();

  for (const movement of movements) {
    assertValidMovement(movement);
    if (seenIds.has(movement.id)) {
      throw new RangeError(`Movement id ${movement.id} is duplicated.`);
    }
    seenIds.add(movement.id);

    if (!dateMatchesPeriod(movement.date, period)) continue;
    if (movement.status === 'cancelled') continue;

    if (movement.category === 'income') {
      addMovement(income, movement);
      addMovement(performance, movement);
      continue;
    }

    addMovement(performance, movement, -1);

    if (movement.category === 'savings') {
      addMovement(savings, movement);
      continue;
    }

    addMovement(costOfLiving, movement);

    if (movement.category === 'dailyExpense' && movement.status === 'realized') {
      realizedDailyCents = addCents(
        realizedDailyCents,
        movement.amountCents,
      );
      dailyMovementIds.push(movement.id);
    }
  }

  const incomeAmount = toMetricAmount(income);
  const savingsAmount = toMetricAmount(savings);
  const dayCount = getDaysInMonth(period.year, period.month);

  return {
    period,
    performance: toMetricAmount(performance),
    costOfLiving: toMetricAmount(costOfLiving),
    dailyAverage: {
      averageCents: Math.round(realizedDailyCents / dayCount),
      daysInMonth: dayCount,
      realizedMovementIds: dailyMovementIds.sort(),
    },
    savings: buildSavingsMetrics(savingsAmount, incomeAmount),
  };
}

function sumMetricAmounts(
  values: readonly MetricAmount[],
): MetricAmount {
  const total = createMutableMetricAmount();

  for (const value of values) {
    total.realizedCents = addCents(total.realizedCents, value.realizedCents);
    total.plannedCents = addCents(total.plannedCents, value.plannedCents);
    total.realizedMovementIds.push(...value.realizedMovementIds);
    total.plannedMovementIds.push(...value.plannedMovementIds);
  }

  return toMetricAmount(total);
}

export function calculateAnnualSavingsMetrics(
  movements: readonly FinancialMovement[],
  year: number,
): AnnualSavingsMetrics {
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new RangeError('Year must be between 1 and 9999.');
  }

  const months = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const summary = calculateFinancialMetrics(movements, { year, month }).savings;
    return { month, savings: summary };
  });

  const yearlySavings = sumMetricAmounts(months.map(({ savings }) => savings.amount));
  const yearlyIncome = sumMetricAmounts(months.map(({ savings }) => savings.income));

  return {
    year,
    savings: buildSavingsMetrics(yearlySavings, yearlyIncome),
    months,
  };
}

export function getMovementIdsForMetric(
  metrics: FinancialMetrics,
  metric: FinancialMetricKey,
): string[] {
  let ids: readonly string[];

  if (metric === 'performance') {
    ids = [
      ...metrics.performance.realizedMovementIds,
      ...metrics.performance.plannedMovementIds,
    ];
  } else if (metric === 'costOfLiving') {
    ids = [
      ...metrics.costOfLiving.realizedMovementIds,
      ...metrics.costOfLiving.plannedMovementIds,
    ];
  } else if (metric === 'dailyAverage') {
    ids = metrics.dailyAverage.realizedMovementIds;
  } else {
    ids = [
      ...metrics.savings.amount.realizedMovementIds,
      ...metrics.savings.amount.plannedMovementIds,
      ...metrics.savings.income.realizedMovementIds,
      ...metrics.savings.income.plannedMovementIds,
    ];
  }

  return [...new Set(ids)].sort();
}

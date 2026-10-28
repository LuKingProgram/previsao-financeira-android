import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../../shared/theme/AppThemeProvider';
import type {
  AnnualSavingsMetrics,
  MetricAmount,
  SavingsMetrics,
} from '../domain/financialMetrics';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});

export interface SavingsProgressSectionProps {
  readonly summary: AnnualSavingsMetrics;
  readonly onChangeYear: (year: number) => void;
  readonly onSelectYear?: (year: number) => void;
  readonly onSelectMonth: (month: number) => void;
}

function formatMoney(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

function formatPercent(percent: number | null): string {
  return percent === null ? 'Sem entradas' : `${percentFormatter.format(percent)}%`;
}

function clampProgress(percent: number | null): number {
  if (percent === null) return 0;
  return Math.min(100, Math.max(0, percent));
}

function SavingsRateBar({
  label,
  percent,
  color,
}: {
  readonly label: string;
  readonly percent: number | null;
  readonly color: string;
}) {
  const progress = clampProgress(percent);
  const { colors } = useAppTheme();

  return (
    <View style={styles.rateBlock}>
      <View style={styles.rateLabelRow}>
        <Text style={[styles.secondaryLabel, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.rateValue, { color: colors.text }]}>{formatPercent(percent)}</Text>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${label}: ${formatPercent(percent)}`}
        accessibilityValue={{ min: 0, max: 100, now: progress }}
        style={[styles.barTrack, { backgroundColor: colors.raised }]}
      >
        <View
          style={[
            styles.barFill,
            { width: `${progress}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function AmountRow({ label, amount }: { readonly label: string; readonly amount: number }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.amountRow}>
      <Text style={[styles.secondaryLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.amountValue, { color: colors.text }]}>{formatMoney(amount)}</Text>
    </View>
  );
}

function SavingsAmounts({ savings, income }: { readonly savings: MetricAmount; readonly income: MetricAmount }) {
  return (
    <View style={styles.amounts}>
      <AmountRow label="Economias realizadas" amount={savings.realizedCents} />
      <AmountRow label="Entradas realizadas" amount={income.realizedCents} />
      <AmountRow label="Economias projetadas" amount={savings.projectedCents} />
      <AmountRow label="Entradas projetadas" amount={income.projectedCents} />
    </View>
  );
}

function RatePair({ summary }: { readonly summary: SavingsMetrics }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.rates}>
      <SavingsRateBar
        label="Percentual realizado"
        percent={summary.realizedRatePercent}
        color={colors.realized}
      />
      <SavingsRateBar
        label="Percentual projetado"
        percent={summary.projectedRatePercent}
        color={colors.planned}
      />
    </View>
  );
}

function SummaryCard({
  title,
  summary,
  onPress,
}: {
  readonly title: string;
  readonly summary: SavingsMetrics;
  readonly onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const content = (
    <>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      <SavingsAmounts savings={summary.amount} income={summary.income} />
      <RatePair summary={summary} />
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, abrir lançamentos do período`}
        onPress={onPress}
        style={({ pressed }) => [styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {content}
    </View>
  );
}

function MonthCard({
  year,
  month,
  summary,
  onPress,
}: {
  readonly year: number;
  readonly month: number;
  readonly summary: SavingsMetrics;
  readonly onPress: () => void;
}) {
  const monthName = MONTH_NAMES[month - 1] ?? `Mês ${month}`;
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir lançamentos de ${monthName} de ${year}`}
      onPress={onPress}
      style={({ pressed }) => [styles.monthCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}
    >
      <Text style={[styles.monthTitle, { color: colors.text }]}>{monthName}</Text>
      <SavingsAmounts savings={summary.amount} income={summary.income} />
      <RatePair summary={summary} />
    </Pressable>
  );
}

export function SavingsProgressSection({
  summary,
  onChangeYear,
  onSelectYear,
  onSelectMonth,
}: SavingsProgressSectionProps) {
  const { colors } = useAppTheme();
  const canGoToPreviousYear = summary.year > 1;
  const canGoToNextYear = summary.year < 9999;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          Economias
        </Text>
        <View style={[styles.yearSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ano anterior"
            disabled={!canGoToPreviousYear}
            onPress={() => onChangeYear(summary.year - 1)}
            style={styles.yearButton}
          >
            <Text style={[styles.yearButtonText, { color: canGoToPreviousYear ? colors.text : colors.muted }]}>
              ‹
            </Text>
          </Pressable>
          <Text accessibilityRole="header" style={[styles.year, { color: colors.text }]}>
            {summary.year}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próximo ano"
            disabled={!canGoToNextYear}
            onPress={() => onChangeYear(summary.year + 1)}
            style={styles.yearButton}
          >
            <Text style={[styles.yearButtonText, { color: canGoToNextYear ? colors.text : colors.muted }]}>
              ›
            </Text>
          </Pressable>
        </View>
      </View>

      <SummaryCard
        title="Total do ano"
        summary={summary.savings}
        onPress={onSelectYear ? () => onSelectYear(summary.year) : undefined}
      />

      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>
        Evolução mensal
      </Text>
      <View style={styles.monthList}>
        {summary.months.map(({ month, savings }) => (
          <MonthCard
            key={month}
            year={summary.year}
            month={month}
            summary={savings}
            onPress={() => onSelectMonth(month)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  yearSelector: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  yearButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  yearButtonText: {
    fontSize: 28,
  },
  year: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  amounts: {
    gap: 8,
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryLabel: {
    fontSize: 13,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  rates: {
    gap: 12,
  },
  rateBlock: {
    gap: 6,
  },
  rateLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  barTrack: {
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 999,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  monthList: {
    gap: 12,
  },
  monthCard: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});

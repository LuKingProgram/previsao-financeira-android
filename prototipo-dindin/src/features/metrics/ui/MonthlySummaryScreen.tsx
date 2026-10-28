import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomNavigation } from '../../../shared/ui/BottomNavigation';
import { DemoBanner } from '../../../shared/ui/DemoBanner';
import { useAppTheme } from '../../../shared/theme/AppThemeProvider';
import { shiftYearMonth, type YearMonth } from '../../../shared/dates/localDate';
import { useDemoLedger } from '../../ledger/demo/DemoLedgerProvider';
import {
  calculateAnnualSavingsMetrics,
  calculateFinancialMetrics,
  type FinancialMetricKey,
} from '../domain/financialMetrics';
import { SavingsProgressSection } from './SavingsProgressSection';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export interface MetricNavigationRequest extends YearMonth {
  readonly metric: FinancialMetricKey;
}

export interface PeriodNavigationRequest extends YearMonth {
  readonly scope: 'month' | 'year';
}

export interface MonthlySummaryScreenProps {
  readonly onOpenMetric: (request: MetricNavigationRequest) => void;
  readonly onOpenPeriod: (period: PeriodNavigationRequest) => void;
  readonly onAdd: () => void;
  readonly onShowMovements: () => void;
  readonly onSettings: () => void;
}

function formatMoney(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

function formatMonth(period: YearMonth): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(period.year, period.month - 1, 1)));
}

function MetricRow({
  title,
  realizedCents,
  projectedCents,
  onPress,
}: {
  readonly title: string;
  readonly realizedCents: number;
  readonly projectedCents?: number;
  readonly onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir lançamentos de ${title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.metricRow, pressed && styles.pressed]}
    >
      <View style={styles.metricHeading}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricHint}>
          {projectedCents === undefined ? 'Valor realizado' : 'Realizado e projeção'}
        </Text>
      </View>
      <View style={styles.metricValues}>
        <Text style={[styles.metricValue, { color: colors.realized }]}>
          {formatMoney(realizedCents)}
        </Text>
        {projectedCents !== undefined && (
          <Text style={[styles.projectedValue, { color: colors.planned }]}>
            {formatMoney(projectedCents)} projetado
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function MonthlySummaryScreen({
  onOpenMetric,
  onOpenPeriod,
  onAdd,
  onShowMovements,
  onSettings,
}: MonthlySummaryScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { movements, today } = useDemoLedger();
  const [period, setPeriod] = useState<YearMonth>(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)),
  }));

  const metrics = useMemo(
    () => calculateFinancialMetrics(movements, period),
    [movements, period],
  );
  const annualSavings = useMemo(
    () => calculateAnnualSavingsMetrics(movements, period.year),
    [movements, period.year],
  );
  const openMetric = (metric: FinancialMetricKey) =>
    onOpenMetric({ ...period, metric });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View>
            <Text accessibilityRole="header" style={styles.brand}>Din Din</Text>
            <Text style={styles.screenLabel}>Resumo financeiro</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir configurações"
            onPress={onSettings}
            style={styles.menuButton}
          >
            <Text style={styles.menuGlyph}>•••</Text>
          </Pressable>
        </View>

        <DemoBanner />

        <View style={styles.periodSelector}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
            onPress={() => setPeriod((current) => shiftYearMonth(current, -1))}
            style={styles.periodButton}
          >
            <Text style={styles.periodButtonText}>‹</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.periodLabel}>
            {formatMonth(period)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
            onPress={() => setPeriod((current) => shiftYearMonth(current, 1))}
            style={styles.periodButton}
          >
            <Text style={styles.periodButtonText}>›</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir movimentos que formam a performance do mês"
          onPress={() => openMetric('performance')}
          style={({ pressed }) => [styles.performance, pressed && styles.pressed]}
        >
          <Text style={styles.performanceLabel}>Performance do mês</Text>
          <Text style={[styles.performanceValue, { color: colors.realized }]}>
            {formatMoney(metrics.performance.realizedCents)}
          </Text>
          <View style={styles.performanceProjection}>
            <Text style={styles.projectionLabel}>Projeção</Text>
            <Text style={[styles.projectionValue, { color: colors.planned }]}>
              {formatMoney(metrics.performance.projectedCents)}
            </Text>
          </View>
          <Text style={styles.tapHint}>Toque para ver os lançamentos incluídos</Text>
        </Pressable>

        <View style={styles.metricsList}>
          <MetricRow
            title="Custo de vida"
            realizedCents={metrics.costOfLiving.realizedCents}
            projectedCents={metrics.costOfLiving.projectedCents}
            onPress={() => openMetric('costOfLiving')}
          />
          <MetricRow
            title="Diário médio"
            realizedCents={metrics.dailyAverage.averageCents}
            onPress={() => openMetric('dailyAverage')}
          />
        </View>

        <SavingsProgressSection
          summary={annualSavings}
          selectedMonth={period.month}
          onChangeMonth={(month) => setPeriod((current) => ({ ...current, month }))}
          onChangeYear={(year) => setPeriod((current) => ({ ...current, year }))}
          onSelectYear={(year) => onOpenPeriod({ year, month: 1, scope: 'year' })}
          onSelectMonth={(month) => onOpenPeriod({ year: period.year, month, scope: 'month' })}
        />
      </ScrollView>

      <BottomNavigation
        active="summary"
        onSummary={() => undefined}
        onMovements={onShowMovements}
        onAdd={onAdd}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    safeArea: { flex: 1 },
    content: { gap: 18, padding: 20, paddingBottom: 28 },
    topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    brand: { color: colors.text, fontSize: 25, fontWeight: '700' },
    screenLabel: { color: colors.muted, fontSize: 14, marginTop: 2 },
    menuButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 22,
      borderWidth: 1,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    menuGlyph: { color: colors.text, fontSize: 16, fontWeight: '700' },
    periodSelector: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
    },
    periodButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
    periodButtonText: { color: colors.text, fontSize: 28, lineHeight: 32 },
    periodLabel: { color: colors.text, fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
    performance: {
      backgroundColor: colors.raised,
      borderColor: colors.border,
      borderRadius: 22,
      borderWidth: 1,
      gap: 8,
      padding: 20,
    },
    performanceLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
    performanceValue: { fontSize: 32, fontWeight: '700' },
    performanceProjection: {
      alignItems: 'center',
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
      paddingTop: 12,
    },
    projectionLabel: { color: colors.muted, fontSize: 14 },
    projectionValue: { fontSize: 17, fontWeight: '700' },
    tapHint: { color: colors.muted, fontSize: 12, marginTop: 4 },
    metricsList: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      overflow: 'hidden',
    },
    metricRow: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 82,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    metricHeading: { flex: 1, gap: 5 },
    metricTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
    metricHint: { color: colors.muted, fontSize: 12 },
    metricValues: { alignItems: 'flex-end', gap: 4 },
    metricValue: { fontSize: 16, fontWeight: '700' },
    projectedValue: { fontSize: 12, fontWeight: '600' },
    pressed: { opacity: 0.74 },
  });
}

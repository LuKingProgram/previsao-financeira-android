import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../../../shared/ui/BottomNavigation';
import { DemoBanner } from '../../../shared/ui/DemoBanner';
import { getYearMonthFromLocalDate, shiftYearMonth, type YearMonth } from '../../../shared/dates/localDate';
import { useAppTheme } from '../../../shared/theme/AppThemeProvider';
import { useDemoLedger, type LedgerMovement } from '../demo/DemoLedgerProvider';
import {
  calculateAnnualSavingsMetrics,
  calculateFinancialMetrics,
  getMovementIdsForMetric,
  type FinancialMetricKey,
} from '../../metrics/domain/financialMetrics';

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const categoryLabels: Record<LedgerMovement['category'], string> = {
  income: 'Entrada',
  fixedExpense: 'Saída fixa',
  dailyExpense: 'Gasto diário',
  savings: 'Economia',
  cardExpense: 'Compra no cartão',
  dailyForecast: 'Previsão diária',
};

const metricLabels: Record<FinancialMetricKey, string> = {
  performance: 'Performance',
  costOfLiving: 'Custo de vida',
  dailyAverage: 'Diário médio',
  savings: 'Economias',
};

export interface MovementListScreenProps {
  readonly period?: YearMonth;
  readonly metric?: FinancialMetricKey;
  readonly scope?: 'month' | 'year';
  readonly onBackToSummary: () => void;
  readonly onAdd: () => void;
  readonly onSettings: () => void;
}

function formatMoney(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

function formatMonth(period: YearMonth): string {
  return monthFormatter.format(new Date(Date.UTC(period.year, period.month - 1, 1)));
}

function getMetricMovementIds(
  movements: readonly LedgerMovement[],
  period: YearMonth,
  metric: FinancialMetricKey,
  scope: 'month' | 'year',
): string[] {
  if (scope === 'year' && metric === 'savings') {
    const annual = calculateAnnualSavingsMetrics(movements, period.year);
    return [
      ...annual.savings.amount.realizedMovementIds,
      ...annual.savings.amount.plannedMovementIds,
      ...annual.savings.income.realizedMovementIds,
      ...annual.savings.income.plannedMovementIds,
    ].sort();
  }

  return getMovementIdsForMetric(
    calculateFinancialMetrics(movements, period),
    metric,
  );
}

function MovementRow({ movement }: { readonly movement: LedgerMovement }) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const sign = movement.category === 'income' ? '+' : '−';
  const amountColor =
    movement.status === 'cancelled'
      ? colors.muted
      : movement.category === 'income'
        ? colors.realized
        : movement.status === 'planned'
          ? colors.planned
          : colors.text;

  return (
    <View style={[styles.movementRow, movement.status === 'cancelled' && styles.cancelledRow]}>
      <View style={styles.movementText}>
        <Text style={styles.movementDescription}>
          {movement.description?.trim() || categoryLabels[movement.category]}
        </Text>
        <Text style={styles.movementMeta}>
          {movement.date.split('-').reverse().join('/')} · {categoryLabels[movement.category]}
        </Text>
        <Text style={styles.movementStatus}>
          {movement.status === 'realized'
            ? 'Realizado'
            : movement.status === 'planned'
              ? 'Previsto'
              : 'Cancelado'}
        </Text>
      </View>
      <Text style={[styles.movementAmount, { color: amountColor }]}>
        {sign} {formatMoney(movement.amountCents)}
      </Text>
    </View>
  );
}

export function MovementListScreen({
  period,
  metric,
  scope: initialScope,
  onBackToSummary,
  onAdd,
  onSettings,
}: MovementListScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { movements, today } = useDemoLedger();
  const currentPeriod = getYearMonthFromLocalDate(today) ?? { year: 2026, month: 1 };
  const [selectedPeriod, setSelectedPeriod] = useState<YearMonth>(period ?? currentPeriod);
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const selectedScope: 'month' | 'year' | 'all' = metric
    ? initialScope ?? 'month'
    : initialScope === 'year'
      ? 'year'
      : showAllPeriods
        ? 'all'
        : 'month';

  const metricMovementIds = useMemo(() => {
    if (!metric || selectedScope === 'all') return null;
    return getMetricMovementIds(movements, selectedPeriod, metric, selectedScope);
  }, [metric, movements, selectedPeriod, selectedScope]);

  const visibleMovements = useMemo(() => {
    const includedIds = metricMovementIds ? new Set(metricMovementIds) : null;

    return movements
      .filter((movement) => {
        if (includedIds) return includedIds.has(movement.id);
        if (selectedScope === 'all') return true;
        if (selectedScope === 'year') return movement.date.startsWith(`${selectedPeriod.year}-`);
        return movement.date.startsWith(
          `${String(selectedPeriod.year).padStart(4, '0')}-${String(selectedPeriod.month).padStart(2, '0')}-`,
        );
      })
      .sort((left, right) => right.date.localeCompare(left.date));
  }, [metricMovementIds, movements, selectedPeriod, selectedScope]);

  const periodTitle =
    selectedScope === 'all'
      ? 'Todos os períodos'
      : selectedScope === 'year'
        ? String(selectedPeriod.year)
        : formatMonth(selectedPeriod);
  const title = metric ? `Movimentos de ${metricLabels[metric]}` : 'Movimentos';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar ao resumo"
            onPress={onBackToSummary}
            style={styles.backButton}
          >
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <View style={styles.titleGroup}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{periodTitle}</Text>
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

        {metric ? (
          <Text style={styles.exactListNote}>
            Esta lista contém apenas os movimentos usados no cálculo selecionado.
          </Text>
        ) : selectedScope === 'year' ? null : (
          <View style={styles.periodControls}>
            <View style={styles.monthSelector}>
              {selectedScope === 'month' && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Mês anterior"
                  onPress={() => setSelectedPeriod((current) => shiftYearMonth(current, -1))}
                  style={styles.periodButton}
                >
                  <Text style={styles.periodGlyph}>‹</Text>
                </Pressable>
              )}
              <Text style={styles.periodTitle}>{periodTitle}</Text>
              {selectedScope === 'month' && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Próximo mês"
                  onPress={() => setSelectedPeriod((current) => shiftYearMonth(current, 1))}
                  style={styles.periodButton}
                >
                  <Text style={styles.periodGlyph}>›</Text>
                </Pressable>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: showAllPeriods }}
              onPress={() => setShowAllPeriods((value) => !value)}
              style={[styles.scopeButton, showAllPeriods && { borderColor: colors.realized }]}
            >
              <Text style={[styles.scopeText, showAllPeriods && { color: colors.realized }]}>
                {showAllPeriods ? 'Mostrar mês' : 'Todos os períodos'}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.list}>
          {visibleMovements.length > 0 ? (
            visibleMovements.map((movement) => (
              <MovementRow key={movement.id} movement={movement} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum movimento neste período</Text>
              <Text style={styles.emptyDescription}>
                Adicione um lançamento para acompanhar este mês.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onAdd}
                style={[styles.emptyAction, { backgroundColor: colors.realized }]}
              >
                <Text style={[styles.emptyActionText, { color: colors.background }]}>
                  Adicionar movimento
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavigation
        active="movements"
        onSummary={onBackToSummary}
        onMovements={() => undefined}
        onAdd={onAdd}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    safeArea: { flex: 1 },
    content: { gap: 16, padding: 20, paddingBottom: 28 },
    topBar: { alignItems: 'center', flexDirection: 'row', gap: 10 },
    backButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 22,
      borderWidth: 1,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    backGlyph: { color: colors.text, fontSize: 28, lineHeight: 32 },
    titleGroup: { flex: 1, gap: 3 },
    title: { color: colors.text, fontSize: 19, fontWeight: '700' },
    subtitle: { color: colors.muted, fontSize: 13, textTransform: 'capitalize' },
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
    exactListNote: { color: colors.muted, fontSize: 13, lineHeight: 19 },
    periodControls: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    monthSelector: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginRight: 10,
      paddingHorizontal: 6,
    },
    periodButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 38 },
    periodGlyph: { color: colors.text, fontSize: 26, lineHeight: 30 },
    periodTitle: { color: colors.text, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
    scopeButton: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 42,
      paddingHorizontal: 10,
    },
    scopeText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
    list: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      overflow: 'hidden',
    },
    movementRow: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
      minHeight: 84,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    cancelledRow: { opacity: 0.58 },
    movementText: { flex: 1, gap: 4 },
    movementDescription: { color: colors.text, fontSize: 15, fontWeight: '600' },
    movementMeta: { color: colors.muted, fontSize: 12 },
    movementStatus: { color: colors.muted, fontSize: 12 },
    movementAmount: { fontSize: 15, fontWeight: '700' },
    emptyState: { alignItems: 'flex-start', gap: 10, padding: 20 },
    emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
    emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 20 },
    emptyAction: { borderRadius: 12, marginTop: 6, paddingHorizontal: 16, paddingVertical: 12 },
    emptyActionText: { fontSize: 14, fontWeight: '700' },
    pressed: { opacity: 0.74 },
  });
}

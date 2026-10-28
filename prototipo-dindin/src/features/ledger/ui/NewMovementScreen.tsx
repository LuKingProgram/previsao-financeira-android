import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseBrazilianAmountToCents } from '../domain/movementInput';
import { useDemoLedger, type LedgerMovement } from '../demo/DemoLedgerProvider';
import { useAppTheme } from '../../../shared/theme/AppThemeProvider';
import { formatBrazilianDate, parseBrazilianDate } from '../../../shared/dates/localDate';
import { DemoBanner } from '../../../shared/ui/DemoBanner';
import type { MovementCategory } from '../../metrics/domain/financialMetrics';

const categoryOptions: readonly { readonly value: MovementCategory; readonly label: string }[] = [
  { value: 'income', label: 'Entrada' },
  { value: 'fixedExpense', label: 'Saída fixa' },
  { value: 'dailyExpense', label: 'Gasto diário' },
  { value: 'savings', label: 'Economia' },
  { value: 'cardExpense', label: 'Compra no cartão' },
  { value: 'dailyForecast', label: 'Previsão diária' },
];

export interface NewMovementScreenProps {
  readonly onBack: () => void;
  readonly onSaved: () => void;
}

function getSuggestedStatus(date: string, today: string): 'realized' | 'planned' {
  return date > today ? 'planned' : 'realized';
}

function makeDemoId(): string {
  return `demo-entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function NewMovementScreen({ onBack, onSaved }: NewMovementScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { addMovement, today } = useDemoLedger();
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [dateText, setDateText] = useState(formatBrazilianDate(today));
  const [category, setCategory] = useState<MovementCategory | null>(null);
  const [status, setStatus] = useState<'realized' | 'planned'>(() =>
    getSuggestedStatus(today, today),
  );
  const [statusWasChanged, setStatusWasChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function changeDate(value: string) {
    setDateText(value);
    if (statusWasChanged) return;

    const date = parseBrazilianDate(value);
    if (date) setStatus(getSuggestedStatus(date, today));
  }

  async function saveMovement() {
    if (saving) return;
    const date = parseBrazilianDate(dateText);
    const amountCents = parseBrazilianAmountToCents(amountText);

    if (amountCents === null) {
      setError('Informe um valor válido em reais.');
      return;
    }
    if (!date) {
      setError('Informe uma data válida no formato dia/mês/ano.');
      return;
    }
    if (!category) {
      setError('Escolha uma categoria para continuar.');
      return;
    }

    const movement: LedgerMovement = {
      id: makeDemoId(),
      description: description.trim() || undefined,
      date,
      amountCents,
      status,
      category,
    };

    setSaving(true);
    try {
      await addMovement(movement);
      setError(null);
      onSaved();
    } catch {
      setError('Não foi possível salvar no aparelho. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>Novo movimento</Text>
        </View>

        <DemoBanner />

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              accessibilityLabel="Descrição"
              onChangeText={setDescription}
              placeholder="Ex.: mercado"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={description}
              maxLength={80}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Valor</Text>
            <TextInput
              accessibilityLabel="Valor"
              keyboardType="decimal-pad"
              onChangeText={(value) => {
                setAmountText(value);
                setError(null);
              }}
              placeholder="0,00"
              placeholderTextColor={colors.muted}
              style={styles.amountInput}
              value={amountText}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data</Text>
            <TextInput
              accessibilityLabel="Data"
              keyboardType="numeric"
              onChangeText={(value) => {
                changeDate(value);
                setError(null);
              }}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={dateText}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoryGrid}>
              {categoryOptions.map((option) => {
                const selected = category === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setCategory(option.value);
                      if (option.value === 'dailyForecast') {
                        setStatus('planned');
                        setStatusWasChanged(true);
                      }
                      setError(null);
                    }}
                    style={[
                      styles.categoryButton,
                      selected && { borderColor: colors.realized, backgroundColor: colors.raised },
                    ]}
                  >
                    <Text style={[styles.categoryText, selected && { color: colors.realized }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.statusOptions}>
              {(['realized', 'planned'] as const).map((option) => {
                const selected = status === option;
                const label = option === 'realized' ? 'Realizado' : 'Previsto';
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  disabled={category === 'dailyForecast' && option === 'realized'}
                    onPress={() => {
                      setStatus(option);
                      setStatusWasChanged(true);
                    }}
                    style={[
                      styles.statusButton,
                      selected && {
                        borderColor: option === 'realized' ? colors.realized : colors.planned,
                        backgroundColor: colors.raised,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        selected && { color: option === 'realized' ? colors.realized : colors.planned },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              {category === 'dailyForecast'
                ? 'Uma previsão diária fica como prevista. Para registrar o gasto realizado, use “Gasto diário”.'
                : 'A sugestão acompanha a data; você pode alterar o estado.'}
            </Text>
          </View>
        </View>

        {error && (
          <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
            {error}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={saveMovement}
          disabled={saving}
          style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.realized }, pressed && styles.pressed]}
        >
          <Text style={[styles.saveText, { color: colors.background }]}>Salvar movimento</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    safeArea: { flex: 1 },
    content: { gap: 18, padding: 20, paddingBottom: 32 },
    header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
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
    title: { color: colors.text, fontSize: 22, fontWeight: '700' },
    form: { gap: 16 },
    field: { gap: 8 },
    label: { color: colors.text, fontSize: 14, fontWeight: '600' },
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.text,
      fontSize: 16,
      minHeight: 50,
      paddingHorizontal: 14,
    },
    amountInput: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.text,
      fontSize: 22,
      fontWeight: '600',
      minHeight: 58,
      paddingHorizontal: 14,
    },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 11,
      borderWidth: 1,
      minHeight: 42,
      justifyContent: 'center',
      paddingHorizontal: 11,
    },
    categoryText: { color: colors.text, fontSize: 13, fontWeight: '600' },
    statusOptions: { flexDirection: 'row', gap: 10 },
    statusButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 11,
      borderWidth: 1,
      flex: 1,
      minHeight: 46,
      justifyContent: 'center',
    },
    statusText: { color: colors.text, fontSize: 14, fontWeight: '600' },
    hint: { color: colors.muted, fontSize: 12, lineHeight: 17 },
    error: { fontSize: 14, fontWeight: '600' },
    saveButton: { alignItems: 'center', borderRadius: 13, justifyContent: 'center', minHeight: 52 },
    saveText: { fontSize: 15, fontWeight: '700' },
    pressed: { opacity: 0.75 },
  });
}

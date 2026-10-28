import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme, type ThemeMode } from '../../../shared/theme/AppThemeProvider';
import { BottomNavigation } from '../../../shared/ui/BottomNavigation';
import { DemoBanner } from '../../../shared/ui/DemoBanner';

export interface SettingsScreenProps {
  readonly onBackToSummary: () => void;
  readonly onShowMovements: () => void;
  readonly onAdd: () => void;
}

const themeOptions: readonly { readonly value: ThemeMode; readonly label: string }[] = [
  { value: 'dark', label: 'Escuro' },
  { value: 'light', label: 'Claro' },
];

export function SettingsScreen({
  onBackToSummary,
  onShowMovements,
  onAdd,
}: SettingsScreenProps) {
  const { mode, setMode, colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar ao resumo"
            onPress={onBackToSummary}
            style={styles.backButton}
          >
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>Configurações</Text>
        </View>

        <DemoBanner />

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Aparência</Text>
          <Text style={styles.description}>Escolha o tema de leitura do Din Din.</Text>
          <View style={styles.themeOptions}>
            {themeOptions.map((option) => {
              const selected = option.value === mode;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setMode(option.value)}
                  style={[
                    styles.themeButton,
                    selected && { borderColor: colors.realized, backgroundColor: colors.raised },
                  ]}
                >
                  <Text style={[styles.themeButtonText, selected && { color: colors.realized }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.note}>A escolha vale durante esta sessão de demonstração.</Text>
        </View>
      </View>

      <BottomNavigation
        active="summary"
        onSummary={onBackToSummary}
        onMovements={onShowMovements}
        onAdd={onAdd}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    safeArea: { flex: 1, justifyContent: 'space-between' },
    content: { gap: 20, padding: 20 },
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
    section: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      gap: 12,
      padding: 18,
    },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
    description: { color: colors.muted, fontSize: 14, lineHeight: 20 },
    themeOptions: { flexDirection: 'row', gap: 10 },
    themeButton: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      flex: 1,
      minHeight: 48,
      justifyContent: 'center',
    },
    themeButtonText: { color: colors.text, fontSize: 15, fontWeight: '600' },
    note: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  });
}

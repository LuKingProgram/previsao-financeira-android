import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';

export type BottomNavigationTab = 'summary' | 'movements';

export interface BottomNavigationProps {
  readonly active: BottomNavigationTab;
  readonly onSummary: () => void;
  readonly onMovements: () => void;
  readonly onAdd: () => void;
}

export function BottomNavigation({
  active,
  onSummary,
  onMovements,
  onAdd,
}: BottomNavigationProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Resumo"
        accessibilityState={{ selected: active === 'summary' }}
        onPress={onSummary}
        style={styles.tab}
      >
        <Text style={[styles.tabText, { color: active === 'summary' ? colors.realized : colors.muted }]}>
          Resumo
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar movimento"
        onPress={onAdd}
        style={[styles.addButton, { backgroundColor: colors.realized }]}
      >
        <Text style={[styles.addText, { color: colors.background }]}>+</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Movimentos"
        accessibilityState={{ selected: active === 'movements' }}
        onPress={onMovements}
        style={styles.tab}
      >
        <Text style={[styles.tabText, { color: active === 'movements' ? colors.realized : colors.muted }]}>
          Movimentos
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 70,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  addText: {
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 34,
  },
});

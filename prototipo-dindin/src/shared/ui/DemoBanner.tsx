import { StyleSheet, Text, View } from 'react-native';

import { useDemoLedger } from '../../features/ledger/demo/DemoLedgerProvider';
import { useAppTheme } from '../theme/AppThemeProvider';

export function DemoBanner() {
  const { colors } = useAppTheme();
  const { isDemo } = useDemoLedger();

  return (
    <View style={[styles.container, { backgroundColor: colors.raised }]}>
      <Text style={[styles.title, { color: colors.planned }]}>{isDemo ? 'Demonstração' : 'Dados no aparelho'}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>
        {isDemo ? 'Dados fictícios. As alterações desaparecem ao fechar o app.' : 'Os dados ficam neste aparelho. A sincronização ainda não está disponível.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
});

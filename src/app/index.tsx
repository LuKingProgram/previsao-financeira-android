import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  background: '#F7F5EF',
  ink: '#18313A',
  muted: '#66777A',
  accent: '#18877F',
  card: '#FFFFFF',
  line: '#DCE4DE',
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PREVISÃO FINANCEIRA</Text>
        <Text style={styles.title}>Seu dinheiro, com clareza.</Text>
        <Text style={styles.description}>
          Uma visão simples das entradas, saídas e do saldo que vem pela frente.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PROJEÇÃO FINANCEIRA</Text>
          <Text style={styles.cardTitle}>O próximo passo começa pelo seu saldo.</Text>
          <Text style={styles.cardBody}>
            Esta base ainda está em planejamento. As primeiras funções e decisões estão
            descritas no roadmap do projeto.
          </Text>
          <View style={styles.rule} />
          <Text style={styles.cardFootnote}>
            Nenhum valor financeiro é solicitado ou armazenado nesta versão.
          </Text>
        </View>

        <Text style={styles.footer}>Projeto independente • Android</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    marginTop: 18,
    maxWidth: 320,
  },
  description: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 340,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 34,
    padding: 22,
  },
  cardLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 29,
    marginTop: 18,
  },
  cardBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  rule: {
    backgroundColor: colors.line,
    height: 1,
    marginVertical: 18,
  },
  cardFootnote: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 'auto',
    paddingTop: 36,
    textAlign: 'center',
  },
});

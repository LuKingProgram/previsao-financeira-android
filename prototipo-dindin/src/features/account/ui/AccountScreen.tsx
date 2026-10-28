import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AccountService } from '../application/accountService';
import { useAppTheme } from '../../../shared/theme/AppThemeProvider';

interface AccountScreenProps {
  readonly service: AccountService | null;
  readonly onBack: () => void;
}

export function AccountScreen({ service, onBack }: AccountScreenProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(service));
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!service) return;
    let active = true;
    void service.currentEmail().then((value) => {
      if (active) setCurrentEmail(value);
    }).catch(() => {
      if (active) setMessage('Não foi possível verificar a conta agora. Tente novamente com internet.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [service]);

  async function signIn() {
    if (!service || loading || !email.trim() || !password) return;
    setLoading(true);
    setMessage('');
    try {
      const verifiedEmail = await service.signIn(email, password);
      setCurrentEmail(verifiedEmail);
      setPassword('');
    } catch {
      setMessage('Não foi possível entrar. Confira seus dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    if (!service || loading) return;
    setLoading(true);
    setMessage('');
    try {
      await service.signOut();
      setCurrentEmail(null);
      setPassword('');
    } catch {
      setMessage('Não foi possível sair da conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar às configurações" onPress={onBack}>
          <Text style={styles.back}>‹ Configurações</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>Conta de teste</Text>
        <Text style={styles.note}>Os lançamentos deste aparelho ainda não são sincronizados nem protegidos pelo login.</Text>
        {!service ? (
          <Text style={styles.message}>Esta instalação ainda não recebeu a configuração pública do Supabase.</Text>
        ) : loading ? (
          <ActivityIndicator accessibilityLabel="Carregando conta" color={colors.realized} />
        ) : currentEmail ? (
          <View style={styles.card}>
            <Text style={styles.label}>Conectado como</Text>
            <Text style={styles.value}>{currentEmail}</Text>
            <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.button}>
              <Text style={styles.buttonText}>Sair da conta</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput accessibilityLabel="E-mail" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
            <Text style={styles.label}>Senha</Text>
            <TextInput accessibilityLabel="Senha" autoComplete="password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
            <Pressable accessibilityRole="button" onPress={() => void signIn()} style={styles.button}>
              <Text style={styles.buttonText}>Entrar</Text>
            </Pressable>
          </View>
        )}
        {!!message && <Text accessibilityRole="alert" style={styles.message}>{message}</Text>}
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { gap: 18, padding: 20 },
    back: { color: colors.realized, fontSize: 16 },
    title: { color: colors.text, fontSize: 24, fontWeight: '700' },
    note: { color: colors.muted, fontSize: 14, lineHeight: 20 },
    card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, gap: 12, padding: 18 },
    label: { color: colors.text, fontSize: 14, fontWeight: '600' },
    value: { color: colors.text, fontSize: 16 },
    input: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, padding: 12 },
    button: { alignItems: 'center', backgroundColor: colors.realized, borderRadius: 10, minHeight: 44, justifyContent: 'center' },
    buttonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
    message: { color: colors.planned, fontSize: 14, lineHeight: 20 },
  });
}


import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { AccountService } from '../src/features/account/application/accountService';
import { AccountScreen } from '../src/features/account/ui/AccountScreen';
import { AppThemeProvider } from '../src/shared/theme/AppThemeProvider';

function show(service: AccountService | null) {
  return render(<AppThemeProvider><AccountScreen service={service} onBack={jest.fn()} /></AppThemeProvider>);
}

test('explains when Supabase is unavailable without hiding local movements', async () => {
  const view = await show(null);
  expect(view.getByText(/ainda não são sincronizados/)).toBeTruthy();
  expect(view.getByText(/ainda não recebeu a configuração/)).toBeTruthy();
  await view.unmount();
});

test('signs in without exposing a password in the UI and can sign out', async () => {
  const service: AccountService = {
    currentEmail: jest.fn().mockResolvedValue(null),
    signIn: jest.fn().mockResolvedValue('owner@example.com'),
    signOut: jest.fn().mockResolvedValue(undefined),
  };
  const view = await show(service);
  await waitFor(() => expect(view.getByLabelText('E-mail')).toBeTruthy());
  await fireEvent.changeText(view.getByLabelText('E-mail'), 'owner@example.com');
  await fireEvent.changeText(view.getByLabelText('Senha'), 'test-password');
  await fireEvent.press(view.getByText('Entrar'));
  await waitFor(() => expect(view.getByText('owner@example.com')).toBeTruthy());
  expect(service.signIn).toHaveBeenCalledWith('owner@example.com', 'test-password');
  expect(view.queryByText('test-password')).toBeNull();
  await fireEvent.press(view.getByText('Sair da conta'));
  await waitFor(() => expect(view.getByLabelText('Senha')).toBeTruthy());
  expect(service.signOut).toHaveBeenCalledTimes(1);
  await view.unmount();
});

test('uses a generic login error without disclosing server details', async () => {
  const service: AccountService = {
    currentEmail: jest.fn().mockResolvedValue(null),
    signIn: jest.fn().mockRejectedValue(new Error('User does not exist')),
    signOut: jest.fn(),
  };
  const view = await show(service);
  await waitFor(() => expect(view.getByLabelText('E-mail')).toBeTruthy());
  await fireEvent.changeText(view.getByLabelText('E-mail'), 'missing@example.com');
  await fireEvent.changeText(view.getByLabelText('Senha'), 'incorrect');
  await fireEvent.press(view.getByText('Entrar'));
  await waitFor(() => expect(view.getByText('Não foi possível entrar. Confira seus dados e tente novamente.')).toBeTruthy());
  expect(view.queryByText('User does not exist')).toBeNull();
  await view.unmount();
});


import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseAccountService } from '../src/infrastructure/supabase/accountRepository';

test('does not query a user when there is no stored session', async () => {
  const getUser = jest.fn();
  const client = { auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }), getUser } } as unknown as SupabaseClient;
  expect(await createSupabaseAccountService(client).currentEmail()).toBeNull();
  expect(getUser).not.toHaveBeenCalled();
});

test('verifies a stored session with the auth server', async () => {
  const client = { auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: { email: 'owner@example.com' } }, error: null }),
  } } as unknown as SupabaseClient;
  expect(await createSupabaseAccountService(client).currentEmail()).toBe('owner@example.com');
});

test('trims the address for sign in and signs out only this device', async () => {
  const signInWithPassword = jest.fn().mockResolvedValue({ data: { user: { email: 'owner@example.com' } }, error: null });
  const signOut = jest.fn().mockResolvedValue({ error: null });
  const client = { auth: { signInWithPassword, signOut } } as unknown as SupabaseClient;
  const service = createSupabaseAccountService(client);
  expect(await service.signIn(' owner@example.com ', 'secret')).toBe('owner@example.com');
  expect(signInWithPassword).toHaveBeenCalledWith({ email: 'owner@example.com', password: 'secret' });
  await service.signOut();
  expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
});


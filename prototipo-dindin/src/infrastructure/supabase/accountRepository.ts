import type { SupabaseClient } from '@supabase/supabase-js';

import type { AccountService } from '../../features/account/application/accountService';

export function createSupabaseAccountService(client: SupabaseClient): AccountService {
  return {
    async currentEmail() {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) return null;
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data.user?.email ?? null;
    },
    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      return data.user?.email ?? null;
    },
    async signOut() {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
    },
  };
}


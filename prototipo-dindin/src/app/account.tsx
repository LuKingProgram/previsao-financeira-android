import { useMemo } from 'react';
import { useRouter } from 'expo-router';

import { AccountScreen } from '../features/account/ui/AccountScreen';
import { createSupabaseAccountService } from '../infrastructure/supabase/accountRepository';
import { getSupabaseClient } from '../infrastructure/supabase/client';

export default function AccountRoute() {
  const router = useRouter();
  const service = useMemo(() => {
    try { return createSupabaseAccountService(getSupabaseClient()); }
    catch { return null; }
  }, []);
  return <AccountScreen service={service} onBack={() => router.back()} />;
}


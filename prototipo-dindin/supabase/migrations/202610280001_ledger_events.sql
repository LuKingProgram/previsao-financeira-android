-- Development migration: immutable, owner-scoped operation log.
-- Apply and verify in an isolated Supabase project before use with financial data.
create table public.ledger_operations (
  owner_id uuid not null references auth.users(id) on delete cascade,
  operation_id text not null check (length(operation_id) between 1 and 200),
  movement_id text not null check (length(movement_id) between 1 and 200),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  primary key (owner_id, operation_id)
);

alter table public.ledger_operations enable row level security;
revoke all on public.ledger_operations from public, anon, authenticated;
grant select, insert on public.ledger_operations to authenticated;
create policy ledger_select_own on public.ledger_operations for select to authenticated
  using (owner_id = (select auth.uid()));
create policy ledger_insert_own on public.ledger_operations for insert to authenticated
  with check (owner_id = (select auth.uid()));

-- Retry the same operation safely; reject an operation ID reused for different data.
create function public.submit_ledger_operation(p_operation_id text, p_movement_id text, p_payload jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  current_user_id uuid := auth.uid();
  saved public.ledger_operations%rowtype;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if p_payload->>'id' is distinct from p_movement_id then raise exception 'Movement ID mismatch'; end if;
  insert into public.ledger_operations (owner_id, operation_id, movement_id, payload)
    values (current_user_id, p_operation_id, p_movement_id, p_payload)
    on conflict (owner_id, operation_id) do nothing;
  select * into strict saved from public.ledger_operations
    where owner_id = current_user_id and operation_id = p_operation_id;
  if saved.movement_id is distinct from p_movement_id or saved.payload is distinct from p_payload then
    raise exception 'Operation ID conflicts with an existing operation';
  end if;
end;
$$;
revoke all on function public.submit_ledger_operation(text,text,jsonb) from public, anon;
grant execute on function public.submit_ledger_operation(text,text,jsonb) to authenticated;

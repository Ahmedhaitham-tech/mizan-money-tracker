CREATE TABLE public.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'Other',
  account_type text NOT NULL DEFAULT 'bank_account',
  currency text NOT NULL DEFAULT 'EGP',
  initial_balance numeric(14,2) NOT NULL DEFAULT 0,
  last_four text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT accounts_name_not_blank CHECK (length(btrim(name)) > 0),
  CONSTRAINT accounts_account_type_valid CHECK (account_type IN ('bank_account','debit_card','credit_card','prepaid_card','cash','digital_wallet','telda','other')),
  CONSTRAINT accounts_currency_valid CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT accounts_last_four_valid CHECK (last_four IS NULL OR last_four ~ '^[0-9]{4}$')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX accounts_user_id_idx ON public.accounts (user_id);

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
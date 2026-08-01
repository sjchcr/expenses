create unique index if not exists exchange_rates_daily_pair_idx
  on public.exchange_rates (from_currency, to_currency, date);

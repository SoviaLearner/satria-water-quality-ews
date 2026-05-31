create table if not exists public.prediction_results (
  id bigserial primary key,
  input_data jsonb not null,
  predicted_class_id integer not null,
  predicted_suitability_tier text not null,
  probabilities jsonb,
  created_at timestamptz not null default now()
);

alter table public.prediction_results enable row level security;

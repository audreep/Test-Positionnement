-- Abonnement à l'infolettre : consentement spécifique et optionnel,
-- distinct du consentement marketing (meilleure pratique Loi 25 / LCAP).
-- Exploité en Phase 2 pour la synchronisation Klaviyo.
alter table public.tp_clients
  add column if not exists infolettre boolean not null default false;

comment on column public.tp_clients.infolettre is
  'Abonnement volontaire à l''infolettre du CFO masqué (case optionnelle du formulaire d''intake).';

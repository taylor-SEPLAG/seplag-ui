-- Preparação para integração com backend PostgreSQL/Supabase.
-- O protótipo atual usa IndexedDB; este arquivo não é aplicado automaticamente.
create table if not exists public.cronograma_ciclos (
  ano integer not null check (ano between 1900 and 9999),
  mes integer not null check (mes between 1 and 12),
  configuracao jsonb not null check (
    jsonb_typeof(configuracao) = 'object'
    and configuracao ? 'tituloCiclo'
    and jsonb_typeof(configuracao->'tituloCiclo') = 'string'
    and configuracao ? 'secoes'
    and jsonb_typeof(configuracao->'secoes') = 'array'
  ),
  constraint cronograma_ciclos_mes_ano_unico primary key (ano, mes)
);
-- Eventos ficam na configuração do ciclo e são removidos com ele.
-- INSERT deve tratar SQLSTATE 23505 como tentativa de ciclo duplicado.
-- Integrar autenticação e políticas de acesso antes de expor esta tabela por API.
alter table public.cronograma_ciclos enable row level security;

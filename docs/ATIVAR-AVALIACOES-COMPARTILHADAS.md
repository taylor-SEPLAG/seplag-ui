# Ativação das avaliações compartilhadas

A interface já funciona em modo local. Para que avaliações feitas no GitHub Pages apareçam para o responsável em outro dispositivo, conclua esta configuração.

## 1. Criar o projeto Supabase

1. Crie um projeto em https://supabase.com.
2. Em Authentication, desative cadastro público se apenas usuários previamente criados puderem entrar.
3. Em Authentication > Users, crie cada avaliador com e-mail e senha fixa.
4. Abra SQL Editor e execute integralmente supabase/prototype-reviews.sql.
5. Copie o UUID de cada usuário e cadastre seu perfil conforme o exemplo ao final do SQL.
6. Use role REVIEWER para avaliadores e ADMIN para quem acompanha todas as avaliações.

Nunca coloque service_role no frontend ou no GitHub. Utilize somente a chave pública/publishable. A segurança dos registros depende das políticas RLS incluídas no SQL.

## 2. Configuração local

Copie .env.example para .env.local e preencha:

    VITE_SUPABASE_URL=https://seu-projeto.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
    VITE_PROTOTYPE_VERSION=controle-vagas-2026-07-22

O arquivo .env.local já é ignorado pelo Git.

## 3. Configuração do GitHub Pages

No repositório do GitHub, abra Settings > Secrets and variables > Actions.

Crie a variável:

- VITE_SUPABASE_URL: URL do projeto.

Crie o secret:

- VITE_SUPABASE_PUBLISHABLE_KEY: chave pública do projeto.

O workflow injeta esses valores somente durante o build. A versão utiliza o SHA do commit, permitindo separar avaliações por versão publicada.

## 4. Fluxo de uso

- Avaliador abre o modo Gestão, informa e-mail e senha e avalia os componentes.
- Cada alteração é salva por tela, componente, versão e avaliador.
- O avaliador vê apenas os próprios registros.
- Usuário ADMIN abre o modo Gestão e consulta o acompanhamento consolidado.
- A RLS impede que um avaliador leia ou altere avaliações de outro.

## 5. Estado sem configuração

Sem variáveis Supabase, a interface exibe “Modo local”. O login é apenas demonstrativo e os dados ficam no navegador, não sendo compartilhados.

## 6. Publicação

Depois de configurar as variáveis, faça novo deploy do GitHub Pages. Builds antigos não recebem as configurações retroativamente.

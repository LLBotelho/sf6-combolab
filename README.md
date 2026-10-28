# SF6 ComboLab V7 — Cloud Accounts + GitHub Pages

**Projeto completo, não patch.** Quatro usuários: lucas, luiz, guilherme, julio. Autenticação administrativa Supabase, favoritos/combos isolados por RLS; sem cadastro público na UI.

Guia de publicação e criação segura de contas: **[PUBLICAR.md](PUBLICAR.md)**. No Windows: `PUBLISH-WINDOWS.ps1` (PowerShell com Git + GitHub CLI). Acesse as contas com novas senhas, nunca as publique em Git.

# SF6 ComboLab — login e sincronização na nuvem

Projeto de fã não oficial de Street Fighter 6, sem vínculo com a Capcom. React + TypeScript + Vite + Tailwind CSS. Cada jogador tem favoritos e combos privados por conta, armazenados no projeto Supabase `bwvzxcivxguuyyznpttp`.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://127.0.0.1:5173. Outras opções: `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`.

A configuração do Supabase usa uma **chave publishable**, que pode aparecer no browser. Jamais inclua `service_role`, `sb_secret_*`, senhas ou tokens de acesso no repositório. `.env` é ignorado pelo Git. Se desejar substituir a chave, copie `.env.example` para `.env`.

## Quatro jogadores — como ativar as contas

O login é por **e-mail e senha**, sem tela pública de cadastro. Os jogadores devem ser convidados pelo administrador:

1. Abra [Supabase > Authentication > Users](https://supabase.com/dashboard/project/bwvzxcivxguuyyznpttp/auth/users) e use a opção **Invite user**. Informe os quatro e-mails (um por pessoa), cada um com sua própria senha definida pelo convite.
2. Configure **Authentication > URL Configuration** com a URL real de hospedagem e as Redirect URLs necessárias (por exemplo, `http://127.0.0.1:5173/**` para uso local). Verifique também as configurações de envio de e-mails e o site URL.
3. Após cada convite/conta aparecer em Authentication, **aprove explicitamente** os quatro IDs na tabela `public.allowed_players` (via Table Editor ou SQL Editor, apenas com sua conta de administrador). Exemplo seguro, que não insere e-mails ou senhas em SQL:

   ```sql
   insert into public.allowed_players (user_id)
   values ('UUID-DO-USUARIO-AUTORIZADO')
   on conflict (user_id) do nothing;
   ```

4. Em **Authentication > Providers > Email**, desative inscrições públicas (signup) se apropriado, para impedir contas não convidadas. Mesmo com signup habilitado, usuários fora de `allowed_players` não podem ler/gravar combos devido ao RLS.

A migração `supabase/migrations/20261028010000_player_playbooks.sql` cria a tabela de acesso e a coleção por usuário com RLS. **PENDENTE:** a ferramenta de execução SQL foi bloqueada neste ambiente. Aplique o conteúdo desse arquivo uma vez no SQL Editor do projeto antes de testar o login.

### Importante: SVGs personalizados

Este repositório foi montado a partir dos arquivos e patches previamente entregues na conversa. Os 64 SVGs de personagens, que estavam **apenas no seu computador** em `public/assets/portrait characters` e `public/assets/display characters`, não estavam disponíveis aqui para envio. Copie essas duas pastas do seu projeto local para o clone antes de executar `npm run artwork`; depois faça commit/push dos SVGs. O logo `public/assets/sf6-logo.svg` também deve ser copiado. Enquanto isso, os cards têm fallback de iniciais.

## Migrar combos antigos

Os dados antigos estavam no `localStorage` do navegador (chave `sf6.combo.builder.v1`), por isso não podem ser acessados remotamente. **No mesmo navegador** em que você criou seus combos: faça login na sua conta, abra **Configurações → Migrar dados antigos** e confirme. A cópia original no navegador é preservada. Antes de importar, exporte um backup; a importação substitui os combos existentes da conta.

O app mantém um rascunho local por ID de usuário enquanto alterações estão pendentes e mostra o estado `CLOUD SAVED`, `SYNCING` ou `SYNC ERROR`. Se houver conflito entre dispositivos, nenhuma versão é sobrescrita silenciosamente: exporte um backup e recarregue. A aplicação não foi feita para edição simultânea colaborativa da **mesma** conta.

## Segurança

- `public.allowed_players`: apenas usuários aprovados podem usar o app; somente o administrador pode cadastrar aprovados.
- `public.user_playbooks`: uma linha JSONB por usuário, com RLS restrito a `(select auth.uid()) = user_id` e aprovação explícita.
- Usuários não autenticados não têm privilégios nas tabelas; autenticados não podem excluir ou aprovar jogadores.
- A coluna `revision` impede sobrescrever alterações de outra sessão sem detectar conflito.
- Nenhuma senha é armazenada no código ou nas tabelas do ComboLab; senhas são gerenciadas pelo Supabase Auth.

## Hospedagem

Um repositório GitHub não hospeda automaticamente uma aplicação Vite. Para acessar de qualquer PC sem instalar Node, publique o projeto em Vercel/Netlify ou outro host gratuito e configure a URL em Supabase Auth. Com acesso local pelo Vite em outra máquina, o login e os dados ainda funcionarão, desde que haja conexão com a internet.

## Arquivos e scripts úteis

`src/hooks/useAuth.tsx` = autenticação, `src/hooks/useCollection.tsx` = leitura/salvamento por usuário, `src/pages/LoginPage.tsx` = tela de login, `src/pages/SettingsPage.tsx` = backup e migração, `scripts/generate-fighter-art.mjs` = catálogo dos SVGs, `supabase/migrations` = esquema de banco.

## Publicar no repositório GitHub vazio

No computador onde estão os 64 SVGs, faça cópia de segurança da pasta do projeto. Copie os SVGs para este projeto novo e rode `npm run artwork`. Depois, abra um terminal na raiz e execute:

```bash
git init
git branch -M main
git add .
git commit -m "feat: SF6 ComboLab com autenticação e persistência cloud"
git remote add origin https://github.com/LLBotelho/sf6-combolab.git
git push -u origin main
```

Não execute `git init` nem `remote add` se já houver Git configurado na pasta; nesse caso, use `git remote -v`, configure o remoto existente e faça commit/push. Nunca suba `.env` nem credenciais secretas.

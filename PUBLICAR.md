# Publicar ComboLab e criar 4 acessos

## Estado do ambiente

O banco Supabase já foi configurado (tabelas `allowed_players` e `user_playbooks` com RLS). Este pacote é o **projeto completo atualizado**, não um patch.

**Importante:** o ZIP original não continha os retratos/displays SVG reais. Copie suas pastas `public/assets/portrait characters` e `public/assets/display characters` para este projeto antes do deploy. O arquivo `sf6-logo.svg` incluído é uma substituição provisória; troque pelo seu SVG original.

## Publicação

GitHub Pages usará: `https://llbotelho.github.io/sf6-combolab/` (após ser configurado e o workflow concluir). A pasta `.github/workflows/deploy.yml` produz automaticamente `dist` em cada push na branch main.

**GitHub Free só permite Pages em repositórios públicos**. Seu repositório está privado: confirme seu plano GitHub ou torne-o público conscientemente. Mesmo com repositório privado, não coloque senhas nem chaves secretas no código. O site Pages normalmente é público e exige login apenas para acessar dados do app.

### Linux / WSL / Git Bash (GitHub CLI instalado)

1. `npm install` e `npm run build`.
2. `gh auth login` (ou reutilize a sessão existente).
3. `bash scripts/publish-github.sh` cria branch e PR. Se o repositório ainda estiver vazio, cria primeiro um commit inicial na main.
4. Revise a PR no GitHub; depois `gh pr merge --squash --delete-branch`.
5. Em **Settings > Pages > Build and deployment**, selecione **GitHub Actions**. Consulte a execução do workflow na aba Actions.

### Windows PowerShell (sem WSL)

Use Git Bash para executar `bash scripts/publish-github.sh` ou os comandos git/gh equivalentes.

## Criar quatro jogadores sem e-mails na interface

Supabase Auth exige identificador de e-mail ou telefone. O app recebe somente `lucas`, `luiz`, `guilherme` ou `julio` no formulário, e converte internamente para endereços reservados de teste `@example.com` **sem entrega de e-mail**. Reset por e-mail não funcionará; administrador precisará fazer redefinições no painel de Auth.

1. Abra **Supabase Dashboard > Project Settings > API Keys**. A chave que você precisa é **service_role/secret key**. **Não a coloque no frontend nem no GitHub**.
2. Execute `npm run provision:players` num **terminal local confiável**; o script solicita a chave secretamente, depois uma senha NOVA para cada jogador, sem exibi-las.
3. A criação acontece pelo Supabase Admin Auth e aprova cada usuário em `allowed_players`.
4. Desative signup público em **Authentication > Providers > Email** / configurações de Auth (Allow new users to sign up = off), pois só usuários autorizados são aceitos.
5. Abra a URL do site, faça login com o usuário e a nova senha e teste favoritos e combos em dois navegadores.

**Senhas fornecidas em uma conversa devem ser trocadas** antes de uso. Não repita essas senhas em commits, issues, mensagens ou screenshots.

## Se algo falhar

- Site dá 404: veja o workflow e configurações de Pages; confira `base: '/sf6-combolab/'` no Vite.
- Conta criada mas não entra: confira o usuário cadastrado, `email_confirm: true`, status Auth, e a tabela `allowed_players`.
- Retratos vazios: SVGs precisam estar nas duas pastas `public/assets/...` antes de rodar `npm run build`.
- Save falha: verifique a migração, sessão, políticas RLS, conexão e status na interface.

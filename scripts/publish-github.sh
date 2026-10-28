#!/usr/bin/env bash
# Run from the project root in Linux, WSL or Git Bash after "gh auth login".
set -euo pipefail
cd "$(dirname "$0")/.."
repo="LLBotelho/sf6-combolab"
branch="feat/github-pages-cloud-accounts"
command -v gh >/dev/null || { echo 'Instale GitHub CLI (gh) antes de publicar.'; exit 1; }
gh auth status >/dev/null
portraits=$(find 'public/assets/portrait characters' -type f -iname '*.svg' 2>/dev/null | wc -l || true)
displays=$(find 'public/assets/display characters' -type f -iname '*.svg' 2>/dev/null | wc -l || true)
if [ "${portraits}" -lt 32 ] || [ "${displays}" -lt 32 ]; then
  echo "SVGs ausentes. Esperado 32 portraits e 32 displays; encontrados ${portraits} e ${displays}."; exit 1
fi
npm install --no-audit --no-fund
npm run build
[ -d .git ] || git init -b main
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/${repo}.git"
# The repository started empty; create an initial main commit locally for an actual PR diff.
if ! git ls-remote --heads origin main | grep -q refs/heads/main; then
  git checkout -B main
  printf 'SF6 ComboLab — React + Supabase, deploy via GitHub Actions.\n' > .initial-deploy-note
  git add .initial-deploy-note
  git commit -m 'chore: initialize ComboLab repository'
  git push -u origin main
fi
git fetch origin main
git checkout -B "$branch" origin/main
git add -A
git commit -m 'feat: GitHub Pages deploy and four cloud player accounts'
git push --set-upstream origin "$branch"
gh pr create --repo "$repo" --base main --head "$branch" \
  --title 'Deploy ComboLab: GitHub Pages + private player accounts' \
  --body 'Vite configured for project Pages path; Supabase login, RLS migration, provisioning helper and GitHub Actions deploy. IMPORTANT: Admin approval and Supabase user creation required.'
# Deliberately do not merge automatically before checks & Pages suitability are reviewed.
echo 'PR criada. Confira os checks e faça o merge no GitHub ou via: gh pr merge --squash --delete-branch'

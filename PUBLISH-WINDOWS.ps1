# Execute no PowerShell após instalar Git e GitHub CLI.
# Nunca escreva senhas ou chave service_role neste arquivo.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$repo = 'LLBotelho/sf6-combolab'
$branch = 'feat/github-pages-cloud-accounts'
function Run([string]$command, [string[]]$arguments) {
    & $command @arguments
    if ($LASTEXITCODE -ne 0) { throw "Falha em: $command $($arguments -join ' ')" }
}
if (!(Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Instale GitHub CLI: https://cli.github.com/' }
if (!(Get-Command git -ErrorAction SilentlyContinue)) { throw 'Instale Git: https://git-scm.com/' }
Run gh @('auth', 'status')
if (!(Test-Path '.git')) { Run git @('init', '-b', 'main') }
git remote get-url origin *> $null
if ($LASTEXITCODE -ne 0) { Run git @('remote', 'add', 'origin', "https://github.com/$repo.git") }
# Check for original fighter SVGs: do not deploy placeholder portraits by accident.
$portrait = @(Get-ChildItem -Path 'public/assets/portrait characters' -Filter '*.svg' -Recurse -ErrorAction SilentlyContinue)
$display = @(Get-ChildItem -Path 'public/assets/display characters' -Filter '*.svg' -Recurse -ErrorAction SilentlyContinue)
if ($portrait.Count -lt 32 -or $display.Count -lt 32) { throw "Copie antes os SVGs reais: $($portrait.Count) portraits e $($display.Count) displays encontrados (esperado: 32 de cada)." }
Run npm @('install')
Run npm @('run', 'build')
$remoteMain = git ls-remote --heads origin main
if ($LASTEXITCODE -ne 0) { throw 'Não consegui consultar o repositório.' }
if (!$remoteMain) {
    Run git @('checkout', '-B', 'main')
    'SF6 ComboLab — initial branch for review' | Out-File -FilePath '.initial-deploy-note' -Encoding utf8
    Run git @('add', '.initial-deploy-note')
    Run git @('commit', '-m', 'chore: initialize ComboLab repository')
    Run git @('push', '-u', 'origin', 'main')
}
Run git @('fetch', 'origin', 'main')
Run git @('checkout', '-B', $branch, 'origin/main')
Run git @('add', '-A')
Run git @('commit', '-m', 'feat: deploy ComboLab to Pages with Supabase player accounts')
Run git @('push', '-u', 'origin', $branch)
Run gh @('pr', 'create', '--repo', $repo, '--base', 'main', '--head', $branch, '--title', 'Deploy ComboLab V7 — Pages + cloud accounts', '--body', 'React+TS, private username login through Supabase Auth, RLS migration and GitHub Pages Actions. No passwords in repository.')
Write-Host 'PR publicada. Revise no GitHub. Para fazer merge: gh pr merge --squash --delete-branch'
Write-Host 'Em Settings > Pages selecione Source: GitHub Actions. GitHub Free exige repositório público.'

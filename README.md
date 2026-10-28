# SF6 Combo Builder — ComboLab 🥊

Biblioteca e editor visual de combos de **Street Fighter 6**, criada como projeto pessoal de fã. Aplicação gratuita, sem login e sem backend. Os dados permanecem no navegador, com backup JSON.

## Começar no VS Code

Requisitos: Node.js **22.12+** (ou 20.19+) e npm.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (geralmente `http://127.0.0.1:5173`). Você pode usar **Terminal > New Terminal** no VS Code. Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

Para verificar o TypeScript e a análise estática:

```bash
npm run typecheck
npm run lint
npm test
```

### Projeto Git local

```bash
git init
git add .
git commit -m "feat: MVP do SF6 Combo Builder"
```

**Nenhum repositório remoto foi criado**. Se quiser publicar depois, crie um repositório vazio em seu GitHub e vincule-o explicitamente.

## O que o MVP contém

- Character Select com catálogo configurável de lutadores, busca e coleção de Mains.
- Página individual de cada lutador com 9 categorias, etiquetas e filtros.
- Editor visual: adicionar, selecionar, reordenar e remover comandos; editar nome, categoria, dano, observações e etiquetas.
- Comandos como **dados estruturados** (cada passo possui ID e chave de comando); sprites dos arquivos originais do Figma.
- Salvar, editar, duplicar, favoritar e excluir combos; preservar os combos mesmo ao remover um Main.
- Armazenamento em `localStorage`, com versão do esquema (`version: 1`).
- Exportação e importação JSON com validação básica, limites de tamanho e confirmação antes de substituir dados.
- Layout responsivo com prioridade para desktop.

## Atualização: Character Select da Home

A **Home** mostra os 32 personagens em um painel de retratos recortados (preto e branco) com um palco de prévia à direita. Clique em um retrato para selecionar; clique **Abrir combos** para acessar a página daquele personagem. O botão **Adicionar aos Favoritos** é separado da seleção. O antigo *Featured Fighter* foi removido, assim como a segunda grade duplicada de personagens abaixo da Home. A página **Meus Favoritos** continua disponível.

### SVGs locais (nenhum download automático)

Guarde os retratos em `public/assets/portrait characters/` e as artes grandes em `public/assets/display characters/`. Ao executar `npm run dev` ou `npm run build`, o comando `npm run artwork` gera as listas de URLs de ambos os tipos separadamente. O nome do arquivo identifica o lutador (aceita `Ryu.svg`, `E.Honda.svg`, `Chun-Li.svg`, `C_Viper.svg` etc.). Reinicie o Vite após alterar arquivos.

Se os nomes forem diferentes, ajuste `fighterPortraitOverrides` e `fighterDisplayOverrides` em `src/data/fighterArtwork.ts`, conforme a seção Patch 04 abaixo. Para ajustar o rosto sem modificar o SVG, use `portraitFraming` (por exemplo `'ryu': { x: 50, y: 18, zoom: 1.15 }`). A arte grande usa `object-fit: contain`.

**Importante:** os SVGs do usuário não estão incluídos neste patch, nem são modificados por ele. O app exibirá iniciais provisórias onde faltar um SVG; o display de E. Honda conserva a imagem de referência caso falte seu SVG.

## Atualização: página do lutador em tela única (Playbook V2)

- Em desktops com **largura a partir de 1060 px** e **altura a partir de 640 px**, a página do lutador ocupa a área visível, sem barra de rolagem da página; o rodapé é omitido nessa página para liberar espaço. Em telas menores, o layout empilha e a página pode rolar normalmente por legibilidade.
- O SVG do lutador é reutilizado em destaque **à esquerda**, usando somente as artes de `public/assets/display characters/` (`FighterArtwork` e `fighterArtwork.ts`). Se não houver SVG reconhecido, o fallback existente é mantido.
- Categorias viraram um **select compacto**; a busca e filtros por etiqueta permanecem na barra. Por padrão são mostrados todos os combos, divididos em páginas.
- A quantidade de cards por página é **calculada pela altura real renderizada** em cada viewport usando `ResizeObserver`; mudar filtros, dimensões da janela ou editar um combo redistribui os cards. Sem carregamento remoto.
- Cards com muitos comandos exibem uma **prévia compacta** e o botão **VER SEQUÊNCIA COMPLETA** abre um diálogo para consultar todos os comandos e notas. O diálogo pode ter rolagem interna caso a sequência seja maior que a tela — nada é descartado.
- O editor visual original é preservado, com salvamento, edição, duplicação e exclusão. Dados antigos em `localStorage` não sofrem migração.

## Como usar

1. Na Home, clique no **retrato** do lutador e depois em **Adicionar aos Favoritos**, caso queira salvá-lo na coleção.
2. Clique em **Abrir combos** para acessar a página do lutador.
3. Clique **Criar combo**. Escolha a categoria e adicione comandos nas abas.
4. Clique no comando da prévia para selecioná-lo. Use os botões de reordenação e remoção.
5. Dê nome e clique **Salvar combo**. Volte depois para editar, duplicar ou filtrar.
6. Em **Configurações**, exporte um backup antes de limpar o navegador ou trocar de máquina.

## Estrutura

```text
src/
  components/   # editor, comandos, cards e fighter cards
  data/         # catálogo de personagens e biblioteca de comandos
  hooks/        # estado compartilhado dos combos e persistência
  lib/          # validação, importação, exportação e localStorage
  pages/        # Character Select, personagem, configurações
  types.ts      # modelos e contratos TypeScript
  styles.css    # tokens, estilo do Figma e responsividade
public/assets/
  commands/     # sprites recortados dos PNGs fornecidos
  reference/    # arquivos originais e referência redimensionada
  portrait characters/ # SVGs do painel de seleção (adicionados pelo usuário)
  display characters/  # SVGs de exibição grande (adicionados pelo usuário)
  sf6-logo.svg        # logo (adicionada pelo usuário)
```

## Assets, convenções e limitações

- `Soco.png`, `Chute.png`, `Setas.png`, `Comandos.png`, `Divisor.png` foram divididos em imagens individuais sem redesenhá-los. O design é inspirado no `Character Combos.png` fornecido.
- No ZIP original, apenas **E. Honda** possuía arte. Esta atualização reconhece os SVGs nas pastas `portrait characters` e `display characters`, sem baixar imagens. Se faltar algum arquivo ou o nome não corresponder, o personagem recebe um placeholder.
- A representação gráfica de frente/trás assume que o personagem olha para a direita. Ao inverter de lado no jogo, os comandos relativos mudam.
- Ícones para direções, QCF, QCB, DP e HCB vêm dos assets. HCF e DP invertido reutilizam o sprite espelhado. Double quarter-circle e charge usam notação tipográfica provisória. Comandos de sistema possuem marcadores textuais provisórios, pois não existem sprites específicos fornecidos.
- As abreviações OD e PP/KK são **atalhos visuais**, não uma verificação de moveset: não existe validação automática de quais movimentos são possíveis para cada lutador. O usuário monta e cataloga suas próprias sequências.
- LocalStorage é próprio de **cada navegador e origem**; não há sincronização entre dispositivos. Faça backup com frequência.
- A pasta `dist/` é gerada após o build; após instalação, as funções locais podem operar sem internet.
- Os cards são um catálogo editável no código em `src/data/characters.ts`, não uma promessa de integração em tempo real com o elenco ou conteúdo pago do jogo.

## Direitos autorais

Projeto **não oficial**, sem fins comerciais e sem afiliação com a Capcom. Street Fighter e seus personagens pertencem aos respectivos titulares. O fato de ser um projeto não comercial não implica licença de distribuição dos assets; confira os direitos antes de divulgar ou publicar. Os PNGs foram fornecidos pelo autor do projeto.

### Inicialização opcional

No Windows, dê dois cliques em `START-WINDOWS.bat` (se o Node.js já estiver instalado). No Ubuntu/Linux, execute `./start-linux.sh` no terminal. Os scripts só instalam as dependências quando a pasta `node_modules` ainda não existe e iniciam o Vite.

## Patch 04 — SVGs por contexto e logo ampliada

Os assets agora são organizados em duas pastas **separadas**:

```text
public/
  assets/
    sf6-logo.svg
    portrait characters/
      Ryu.svg
      Chun-Li.svg
      ...
    display characters/
      Ryu.svg
      Chun-Li.svg
      ...
```

- **`portrait characters`**: somente imagens do painel de seleção da Home (enquadramento do rosto).
- **`display characters`**: somente artes grandes do lutador selecionado na Home e da página de combos.
- **`sf6-logo.svg`**: permanece em `public/assets/`; foi ampliada no cabeçalho e também é o favicon.

Os arquivos de cada personagem podem ter o mesmo nome nas duas pastas. `npm run artwork` gera duas listas distintas e transforma espaços em `%20` nas URLs. O projeto procura os personagens por seus IDs/nomes, por exemplo `Ryu.svg`, `E.Honda.svg`, `C_Viper_SF6.svg`. Não copia nem altera imagens originais.

Se a nomenclatura não for reconhecida, indique um caminho manual em `src/data/fighterArtwork.ts` através de `fighterPortraitOverrides` ou `fighterDisplayOverrides`:

```ts
export const fighterPortraitOverrides: Record<string, string> = {
  'ryu': '/assets/portrait%20characters/Ryu.svg',
};
export const fighterDisplayOverrides: Record<string, string> = {
  'ryu': '/assets/display%20characters/Ryu.svg',
};
```

Em casos específicos, ajuste o zoom da imagem no painel pelo mapa `portraitFraming`, que não interfere no display. Para atualizar depois de mover/renomear SVGs, reinicie `npm run dev` (ou execute `npm run artwork`).

Se faltarem artes em alguma pasta, o painel mostrará as iniciais do lutador; a arte grande mostrará iniciais, exceto E. Honda, para quem a imagem original permanece como fallback. **Este patch não inclui seus 64 SVGs**, pois os arquivos estão somente na sua cópia local do projeto.

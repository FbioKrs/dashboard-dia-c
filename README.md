# Painel de Acompanhamento

Painel informativo para exibição contínua em TV Samsung UN55AU7700G de 55", com área lógica fixa de 1920×1080.

> **Este README é o mapa operacional do projeto.**
>
> Sempre que um ZIP deste repositório for recebido, o procedimento obrigatório é: extrair o pacote, ler integralmente este README e somente depois inspecionar/alterar os arquivos vigentes da visão solicitada.
>
> O código atual do repositório prevalece sobre versões históricas presentes em conversas.

---

## 1. Fonte oficial e padrão vigente

O repositório GitHub `painel-acompanhamento` é a fonte oficial do código.

**Padrão vigente: PG-V2.**

O PG-V2 substitui a arquitetura PG-V1 baseada em páginas HTML completas + `iframe`.

### Princípio do PG-V2

O painel é uma aplicação de página única:

```text
index.html (shell único)
    ↓
fragmento da visão
    + CSS específico
    + módulo JS específico
    + fonte de dados
    ↓
próxima visão
    ↓
...
    ↓
fim do ciclo principal
    ↓
reload completo do index.html
```

Não utilizar `iframe` para a circulação das visões do PG-V2.

---

## 2. Identificadores canônicos

| ID | Nome | Situação | Fragmento |
|---|---|---|---|
| **PG-V2** | Padrão Geral | Vigente | `index.html`, `css/painel-base.css`, `js/painel-base.js`, `js/painel-config.js`, `js/painel-player.js` |
| **DC-V1** | Dia C | Em produção | `visoes/dia-c.html` |
| **ME_EXEC-V1** | Metas da Executiva | Em produção | `visoes/metas-executiva.html` |
| **ME_GER-V1** | Metas da Gerência | Reservado / ainda não implementado | A definir |
| **OA-V1** | Obras Ágeis | Convenção reservada | Pode não existir ainda |
| **IND-V1** | Indicadores | Convenção reservada | Pode não existir ainda |
| **PROD-V1** | Produtividade | Convenção reservada | Pode não existir ainda |

### Alias histórico

`META-V1` é nomenclatura antiga da atual **ME_EXEC-V1**. Não criar uma visão separada com esse nome.

---

## 3. Estrutura vigente

```text
painel-acompanhamento/
├── index.html
├── README.md
│
├── visoes/
│   ├── dia-c.html
│   └── metas-executiva.html
│
├── css/
│   ├── painel-base.css
│   ├── dia-c.css
│   └── metas-executiva.css
│
├── js/
│   ├── painel-config.js
│   ├── painel-base.js
│   ├── painel-player.js
│   ├── chart.umd.min.js
│   ├── chartjs-plugin-datalabels.min.js
│   ├── dia-c.js
│   └── metas-executiva.js
│
├── dados/
│   └── metas-executiva.json
│
├── dados.json
│
└── img/
    └── logo-equatorial.svg
```

### Localização canônica do CSS base

Existe somente um CSS base:

```text
css/painel-base.css
```

Não criar `painel-base.css` na raiz ou dentro de `js/`.

---

## 4. Responsabilidades no PG-V2

### `index.html`

Shell único da aplicação. Contém:

- `#stage` 1920×1080;
- cabeçalho global;
- `#conteudoVisao`, onde os fragmentos são injetados;
- bibliotecas compartilhadas;
- carregamento do player central.

O `index.html` não contém a estrutura específica de DC-V1 ou ME_EXEC-V1.


### Shell global: cabeçalho, fundo e identidade visual

O elemento **G6** (área de rotação no topo direito) exibe somente o **contador regressivo em segundos** e a **barra de tempo em escoamento**. O nome da próxima visão/Subvisão não deve ser exibido nesse elemento.

No PG-V2, o shell pertence exclusivamente aos arquivos compartilhados. Isso inclui `#stage`, fundo global, cabeçalho, logo, separador, bloco de título, indicador da visão atual, área de próxima visão/barra de tempo, escala 1920×1080 e transições estruturais.

A estrutura fica no `index.html` e sua aparência fica em `css/painel-base.css`. O `index.html` mantém `width="215"` no logo como fallback de primeira renderização.

**CSS específico de visão não deve selecionar nem sobrescrever elementos do shell**, incluindo `#stage`, `.topo`, `.topo-identidade`, `.logo-equatorial`, `.separador-marca`, `.titulo-principal`, `.subtitulo-principal`, `.visao-indicador`, `.topo-rotacao`, `.proxima-visao`, `.barra-tempo` e `.barra-tempo-preenchimento`.

A visão pode fornecer os **conteúdos** do cabeçalho por meio da API compartilhada (`PAINEL_BASE.definirCabecalho`), mas não deve redefinir sua geometria ou identidade visual.

### `visoes/*.html`

São **fragmentos HTML**, não páginas completas.

Não devem conter:

```text
<!DOCTYPE html>
<html>
<head>
<body>
<script>
```

Devem conter somente o markup necessário para a área específica da visão. Atualmente os fragmentos começam em `<main class="pagina">`.

### `css/painel-base.css`

PG-V2 global e fonte única do shell:

- 1920×1080 e escala;
- `#stage` e fundo global;
- cabeçalho completo e identidade visual;
- logo, título, contexto, próxima visão e barra de tempo;
- superfícies/tipografia compartilhadas;
- transição do slot de fragmentos.

### `css/<visao>.css`

Somente aparência do **corpo do respectivo módulo**, dentro do fragmento injetado em `#conteudoVisao`.

Cada fragmento deve possuir uma classe raiz própria (por exemplo, `.visao-dia-c` ou `.visao-me-exec`) para permitir escopo claro de variáveis e regras específicas. O CSS de visão não pode estilizar o shell global.

### `js/painel-config.js`

Registro central das visões:

- ID;
- estado `ativo`;
- título/subtítulo;
- fragmento;
- CSS;
- módulo JS;
- parâmetros globais do player.

A propriedade `ativo` controla a participação da visão no ciclo principal:

```js
ativo: true   // visão apresentada normalmente
ativo: false  // visão ignorada pelo player
```

Por compatibilidade, se `ativo` não estiver informado, a visão é considerada ativa. O player trabalha apenas com registros onde `ativo !== false`, portanto uma visão desabilitada não consome tempo nem deixa intervalo vazio no ciclo.

### `js/painel-base.js`

Utilidades compartilhadas:

- escala do `#stage`;
- atualização do cabeçalho;
- helpers genéricos.

### `js/painel-player.js`

Controlador da sequência principal.

Os caminhos registrados em `PAINEL_CONFIG.visoes` são relativos ao `index.html`/raiz da aplicação. O player os resolve explicitamente contra `document.baseURI` antes de carregar fragmentos, CSS ou módulos ES. Isso evita que `import()` interprete `./js/...` relativamente ao próprio arquivo `js/painel-player.js` e produza caminhos incorretos como `js/js/...`.

Antes de iniciar o ciclo, o player filtra `PAINEL_CONFIG.visoes` e mantém somente as visões com `ativo !== false`.

Para cada visão ativa:

1. encerra o módulo anterior;
2. carrega o CSS específico;
3. busca/injeta o fragmento;
4. importa o módulo JS;
5. chama `await modulo.iniciar()`;
6. aguarda a visão concluir seu próprio ciclo;
7. chama `modulo.destruir()`;
8. avança para a próxima visão ativa.

Após a última visão, recarrega o `index.html` com um token `_ciclo=<timestamp>`.

### `js/<visao>.js`

Cada módulo deve exportar:

```js
export async function iniciar(contexto) { ... }
export function destruir() { ... }
```

`iniciar()` deve retornar/representar o ciclo completo daquela visão.

A quantidade de Subvisões é responsabilidade do módulo, nunca do player.

---

## 5. Loop principal do PG-V2

```text
INDEX inicia
    ↓
DC-V1.iniciar()
    ↓
DC-V1 percorre Geral + Parceiras
    ↓
DC-V1 termina
    ↓
ME_EXEC-V1.iniciar()
    ↓
ME_EXEC-V1 percorre Geral + Categorias detalhadas
    ↓
ME_EXEC-V1 termina
    ↓
próximas visões...
    ↓
última visão termina
    ↓
INDEX faz reload completo
    ↓
novo ciclo
```

O player **não calcula a duração normal** de visões com Subvisões.

Cada módulo controla seu próprio tempo interno.

### Timeout de segurança

O player possui um limite máximo de segurança por visão (configurado em `painel-config.js`). Esse tempo não é a duração normal da visão; serve apenas para impedir que um erro deixe a TV presa indefinidamente.

---

## 6. Atualização após publicação no GitHub

No final de todas as visões do ciclo principal, o player executa um reload completo usando um parâmetro `_ciclo` variável.

Além disso, fragmentos, CSS e módulos são requisitados com cache-buster.

Objetivos:

- incorporar alterações publicadas no GitHub em um novo ciclo;
- reduzir reaproveitamento de HTML/CSS/JS antigo pelo navegador;
- zerar timers e estados residuais periodicamente.

Os JSONs continuam usando suas próprias estratégias de `no-store`/cache-buster.

---

## 7. PG-V2 — tela e identidade

- Área lógica: **1920×1080**.
- Proporção: **16:9**.
- Sem scroll horizontal ou vertical.
- `overflow: hidden`.
- Escala proporcional para a viewport.
- Centralizado.
- Fonte: `"Segoe UI", Arial, Helvetica, sans-serif`.

Paleta estrutural:

- Fundo: `#eef2f5`
- Superfície: `#ffffff`
- Cabeçalho: `#172331`
- Cabeçalho secundário: `#213345`
- Texto principal: `#27333d`
- Texto secundário: `#74808a`
- Bordas: `#e2e7eb`

Cabeçalho de referência: **96 px**.

---

## 8. DC-V1 — Dia C

### Arquivos

```text
visoes/dia-c.html
css/dia-c.css
js/dia-c.js
dados.json
```

### Subvisões

Criadas dinamicamente a partir das parceiras existentes nos dados:

```text
Visão Geral
↓
Parceira 1
↓
Parceira 2
↓
...
↓
fim do ciclo DC-V1
```

Cada Subvisão permanece **15 segundos**.

A quantidade de parceiras não deve ser hardcoded.

### Dados

`dados.json` é atualizado durante a visão com intervalo padrão de 60 segundos e cache-buster. Em falha, a última informação válida deve continuar em exibição.

---

## 9. ME_EXEC-V1 — Metas da Executiva

### Arquivos

```text
visoes/metas-executiva.html
css/metas-executiva.css
js/metas-executiva.js
dados/metas-executiva.json
```

### Estrutura interna

A primeira Subvisão mostra somente registros `NIVEL = CATEGORIA`.

Depois é criada uma Subvisão para cada Categoria que possuir SubCategorias:

```text
Visão Geral
↓
Categoria com Subcategorias 1
↓
Categoria com Subcategorias 2
↓
...
↓
fim do ciclo ME_EXEC-V1
```

A quantidade de detalhamentos não deve ser hardcoded.

Cada Subvisão permanece **15 segundos**.

### Gráfico

Ordem visual:

```text
INDICADOR | PESO | BARRA / ESCALA | NOTA
```

Escala:

```text
0 a 15
```

Referências verticais:

```text
8,0
10,0
```

Categorias:

```text
< 8        #D4353E
>= 8 < 10  #F9CD17
>= 10      #458039
```

SubCategorias usam tons mais claros equivalentes:

```text
< 8        #E8787E
>= 8 < 10  #FBE37A
>= 10      #7FB06F
```

### Referência visual da ME_EXEC-V1

Preservar o padrão visual aprovado em 02/10/2026:

- o corpo da visão inicia diretamente no painel `Apuração dos Indicadores`; não exibir o antigo título interno, descrição interna, badge de quantidade nem o texto auxiliar da escala;
- a legenda de faixas (`< 8`, `8 a < 10`, `≥ 10`) fica imediatamente após `Apuração dos Indicadores`, na mesma faixa horizontal;
- no canto superior direito do painel existe um cartão horizontal compacto `Nota Geral`, exibido em todas as Subvisões;
- o cartão `Nota Geral` exibe somente o rótulo e o valor, sem texto complementar;
- a `Nota Geral` é calculada pela soma de `APURADO × PESO / 100`, considerando somente registros `NIVEL = CATEGORIA` e desconsiderando SubCategorias;
- a cor do cartão `Nota Geral` segue as mesmas faixas de desempenho da visão;
- Visão Geral mostra somente Categorias em cards compactos alinhados visualmente às demais Subvisões;
- na Visão Geral, o detalhe diagonal no canto superior esquerdo da Categoria permanece reduzido em aproximadamente 50%;
- Categoria principal no detalhamento permanece em card azul-claro, com ícone de barras e detalhe diagonal no canto superior esquerdo, no mesmo conceito dos cartões da DC-V1; a cor do detalhe diagonal segue a faixa da nota da Categoria;
- nome da Categoria pode ocupar até duas linhas;
- SubCategorias em cards individuais recuados;
- hierarquia Categoria → SubCategorias indicada por linha vertical, ramificações e nós;
- colunas `Peso`, `Barra / Escala` e `Nota` permanecem alinhadas entre Categoria e SubCategorias;
- a altura das linhas não deve ser distribuída elasticamente para preencher todo o painel; cada tipo de linha usa altura visual fixa para preservar padrão entre Subvisões;
- Nota exibida em badge tonalizado pela mesma faixa de desempenho;
- somente as linhas verticais de referência em `8,0` e `10,0` permanecem na escala;
- o cabeçalho da escala exibe marcadores triangulares apontando para baixo, com rótulos `8,0` e `10,0`, coloridos conforme a régua de desempenho;
- rótulos numéricos do eixo X não são exibidos além desses marcadores de referência.

### Formato do JSON

O formato canônico de `dados/metas-executiva.json` é uma **lista direta de registros na raiz**:

```json
[
  {
    "INDICADOR": "...",
    "APURADO": 0,
    "PESO": 0,
    "PONDERADO": null,
    "CATEGORIA": "...",
    "NIVEL": "CATEGORIA",
    "SUBCATEGORIA": "",
    "ORDEM_CAT": 1,
    "ORDEM_SUB": 0
  }
]
```

O módulo `js/metas-executiva.js` mantém compatibilidade de leitura com o formato legado `{ "versao": "ME_EXEC-V1", "dados": [...] }`, mas novos arquivos devem usar o array direto.

### Campos do JSON

- `INDICADOR`
- `APURADO`
- `PESO`
- `PONDERADO`
- `CATEGORIA`
- `NIVEL`
- `SUBCATEGORIA`
- `ORDEM_CAT`
- `ORDEM_SUB`

Ordenação:

```text
ORDEM_CAT → ORDEM_SUB
```

---

## 10. ME_GER-V1 — Metas da Gerência

Identificador reservado. Ainda não implementada.

Quando for criada, seguir o mesmo modelo modular:

```text
visoes/metas-gerencia.html
css/metas-gerencia.css
js/metas-gerencia.js
dados/metas-gerencia.json
```

Adicionar a nova visão em `PAINEL_CONFIG.visoes`.

---

## 11. Como criar uma nova visão no PG-V2

1. Criar fragmento em `visoes/`.
2. Criar CSS específico em `css/`.
3. Criar módulo JS em `js/` com `iniciar()` e `destruir()`.
4. Criar fonte de dados, se necessária.
5. Registrar a visão em `PAINEL_CONFIG.visoes`, incluindo `ativo: true` ou `ativo: false`.
6. Garantir que `iniciar()` só termine quando toda a apresentação daquela visão tiver sido concluída.
7. Tratar erros localmente para não derrubar o player.
8. Validar em 1920×1080 e confirmar ausência de scroll.

---

## 11.1. Habilitar e desabilitar visões

A exibição de uma visão deve ser controlada exclusivamente pelo registro em `js/painel-config.js`; não apagar arquivos, comentar blocos inteiros nem alterar `painel-player.js` para suspender temporariamente uma visão.

Exemplo:

```js
{
    id: "ME_EXEC-V1",
    ativo: false,
    nome: "Metas da Executiva",
    titulo: "Metas da Executiva",
    subtitulo: "Acompanhamento das notas por Categoria",
    fragmento: "./visoes/metas-executiva.html",
    css: "./css/metas-executiva.css",
    modulo: "./js/metas-executiva.js"
}
```

Com `ativo: false`, a visão continua integralmente no repositório, mas não é carregada nem apresentada. Para reativá-la, alterar somente para:

```js
ativo: true
```

A ordem dos objetos ativos em `PAINEL_CONFIG.visoes` continua determinando a ordem de apresentação.

---

## 12. Alteração global x específica

### Global — PG-V2

Modificar arquivos compartilhados somente quando a alteração deve valer para todas as visões:

```text
index.html
css/painel-base.css
js/painel-config.js
js/painel-base.js
js/painel-player.js
```

### DC-V1

Preferir:

```text
visoes/dia-c.html
css/dia-c.css
js/dia-c.js
dados.json
```

### ME_EXEC-V1

Preferir:

```text
visoes/metas-executiva.html
css/metas-executiva.css
js/metas-executiva.js
dados/metas-executiva.json
```

Não alterar PG-V2 para resolver um problema exclusivo de uma visão.

---


## 12.1. Regra de integridade do shell e consentimento para exceções

A separação entre **shell global** e **corpo das visões** é uma regra estrutural obrigatória do PG-V2.

Regra:

```text
Shell / identidade / player global
    → index.html + css/painel-base.css + JS compartilhado

Corpo de uma visão
    → visoes/<visao>.html + css/<visao>.css + js/<visao>.js + dados
```

Se uma solicitação futura exigir ou induzir uma implementação que viole essa separação — por exemplo, colocar em `css/metas-executiva.css` uma regra que altere `.topo` ou `#stage` — **não implementar automaticamente**.

Antes de abrir uma exceção, é obrigatório:

1. explicar ao usuário qual regra do PG-V2 seria contrariada;
2. explicar por que a solicitação exigiria desconsiderar a regra e quais efeitos colaterais/manutenções adicionais podem ocorrer;
3. indicar, quando existir, uma alternativa compatível com o PG-V2;
4. solicitar consentimento explícito do usuário para a exceção;
5. somente após o consentimento, implementar a exceção e registrá-la no README, com escopo e justificativa.

**Sem consentimento explícito, prevalece a regra do PG-V2 e a exceção não deve ser aplicada.**

Essa exigência vale também para alterações solicitadas em conversas futuras, desde que este README permaneça vigente no repositório recebido.

---

## 13. Procedimento obrigatório ao receber um ZIP

```text
1. Extrair o ZIP
2. Localizar README.md na raiz
3. Ler README.md integralmente
4. Identificar a visão pela sigla canônica
5. Inspecionar os arquivos vigentes da visão
6. Inspecionar PG-V2 somente se necessário
7. Realizar a alteração no menor conjunto possível de arquivos
8. Validar sintaxe e referências
9. Validar 1920×1080 / ausência de scroll
10. Entregar o repositório atualizado e, quando útil, apenas os arquivos alterados
```

Nunca reconstruir arquivos vigentes com base apenas em versões históricas do chat.

---

## 14. Histórico de arquitetura

### PG-V1 — legado

- múltiplas páginas HTML completas;
- `index.html` alternava `iframe`s;
- cada visão possuía seu próprio cabeçalho e estrutura completa;
- sincronização entre duração do player e loops internos tornou-se complexa.

### PG-V2 — vigente

- único `index.html`;
- shell/cabeçalho/fundo global estilizados exclusivamente em `css/painel-base.css`;
- fragmentos HTML modulares com classe raiz própria;
- CSS específico carregado por visão e restrito ao corpo do módulo;
- módulos JS com ciclo de vida explícito;
- sequência principal baseada em `await modulo.iniciar()`;
- reload completo ao fim de cada ciclo principal.

---

**Padrão vigente: PG-V2**  
**Visões ativas: DC-V1 e ME_EXEC-V1**  
**Visão reservada: ME_GER-V1**


### Inicialização visual do PG-V2

O player **não possui tela inicial de carregamento**. O `index.html` inicia com o shell visualmente oculto e carrega imediatamente a primeira visão configurada. Assim que o fragmento HTML e o CSS dessa visão estão disponíveis, o shell é revelado diretamente com a primeira visão. A transição de fade é aplicada apenas entre visões já em execução, nunca antes da primeira visão. Não usar textos como “Painel de Acompanhamento”, “Carregando visão...” ou “Preparando apresentação...” como estado visual inicial.

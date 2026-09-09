# FinFlow

PWA de gestão de gastos e receitas pessoais. Next.js 15 (App Router) + Firebase
(Auth Google + Firestore), offline-first, deploy na Vercel.

## O que o app faz

- Cadastro rápido de despesa e receita: valor, categoria, forma de pagamento e data em poucos toques.
- Formas de pagamento: PIX, cartão, débito, dinheiro e boleto.
- Cartões com limite, dia de fechamento e dia de vencimento.
- Parcelamento no cartão com alocação automática das parcelas nas faturas.
- Ajuste do dia de pagamento de uma parcela, movendo-a de fatura.
- Categorias de despesa e de receita, com cor e ícone — cada conta cadastra as suas;
  lançamento sem categoria fica em “Sem categoria”.
- **Offline-first**: tudo é gravado no aparelho e sobe sozinho quando a conexão volta.

## Acesso

Login apenas com Google. `rubensojunior6@gmail.com` é o super admin: entra
direto e é o único que vê a tela **Ajustes → Acessos**.

Qualquer outra conta que fizer login cria um pedido em `members/{uid}` com
status `pending` e vê a tela de espera até o admin liberar. O admin pode
liberar e revogar; o documento nunca é apagado, para o histórico não sumir.

A garantia é a regra do Firestore, não a interface: sem `status: approved`
(ou ser o admin), a conta não alcança `users/{uid}` — nem para ler, nem para
escrever. `pnpm test:rules` cobre isso no emulador.

## Estrutura

```
src/
├── app/        # Rotas — wrappers finos das páginas de feature
├── features/   # Domínio: platform, offline, ledger, categories, cards,
│               # transactions, recurrences, invoices, dashboard, settings
└── shared/     # Reuso entre features (componentes, utils, libs, config)
```

## Comandos

Todos os scripts abaixo estão em `package.json`.

### Desenvolvimento

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Sobe o app em `localhost:3000` com hot reload |
| `pnpm build` | Build de produção do Next (o mesmo que a Vercel roda) |
| `pnpm start` | Serve o build de produção localmente, para conferir antes de publicar |
| `pnpm lint` | ESLint com `@rbinflow/eslint-config` — só aponta, não altera |
| `pnpm lint:fix` | O mesmo, aplicando o que dá para corrigir sozinho |
| `pnpm typecheck` | `tsc --noEmit`: checa os tipos sem emitir arquivo |

### Testes

| Comando | O que faz |
|---------|-----------|
| `pnpm test` | Testes unitários de `platform/scripts/test/` — divisão em parcelas e alocação nas faturas |
| `pnpm test:rules` | Sobe o emulador do Firestore e testa `firestore.rules` de verdade: quem entra, quem não entra, e quais campos não podem ser reescritos. Precisa de Java instalado |

### Ambiente

Três arquivos espelhados, mesmas chaves em ordem alfabética:
`.env.example` (commitado, valores vazios), `.env.local` (dev) e
`.env.production` (o que sobe para a Vercel).

| Comando | O que faz |
|---------|-----------|
| `pnpm env:check` | Confere se os três arquivos têm exatamente as mesmas chaves, na mesma ordem. Falha apontando a divergência |
| `pnpm env:sync` | Envia `.env.production` para a Vercel, ambiente `production`. Reenvia cada chave (remove e adiciona), então serve para criar e para atualizar |
| `pnpm env:sync:preview` | O mesmo, com `.env.local` para o ambiente `preview` |

`NEXT_PUBLIC_*` sobe como plaintext; qualquer outra chave sobe como secret.
`DRY_RUN=1 pnpm env:sync` mostra o que seria enviado sem enviar nada.

### Deploy

| Comando | O que faz |
|---------|-----------|
| `pnpm firebase:deploy` | **Publica tudo que este repositório tem de Firebase de uma vez.** Monta a lista de alvos lendo o `firebase.json` e o que existe no disco: hoje são as regras e os índices do Firestore; no dia em que entrarem `functions/`, `storage.rules` ou hosting, eles entram sozinhos na mesma passada, sem editar o script |
| `pnpm firebase:rules` | Só as regras e os índices do Firestore, quando você quer publicar exatamente isso e mais nada |
| `pnpm deploy` | Deploy de produção na Vercel |
| `pnpm deploy:preview` | Deploy de preview na Vercel, com URL própria |

`DRY_RUN=1 pnpm firebase:deploy` mostra os alvos que seriam publicados sem
publicar nada.

Primeira vez em uma máquina nova: `vercel link` e `firebase login`.

## Firebase

Projeto `finflow-785df`. As regras estão em `firestore.rules`, os índices em
`firestore.indexes.json`.

**`firestore.indexes.json` está vazio de propósito.** O app não filtra nem
ordena no Firestore: `listCollectionUseCase` baixa a coleção inteira, guarda no
espelho do IndexedDB, e mês, tipo, categoria e ordenação são resolvidos em
memória — é isso que faz tudo funcionar offline. Índice composto sem consulta
que o use só encarece a escrita. Quando alguma consulta de verdade precisar de
um, declare o índice **dela**, não um conjunto especulativo.

- `members/{uid}` — quem pode entrar. Decisão do admin.
- `users/{uid}/{categories,cards,transactions,installments,recurrences}` — os
  dados de cada conta. Nem o admin lê os lançamentos de outra pessoa.

O e-mail do admin aparece em dois lugares que precisam andar juntos:
`ADMIN_EMAIL` em `src/features/access/constants/access.constants.ts` e
`isAdmin()` em `firestore.rules`.

**Domínios autorizados:** ao publicar na Vercel, adicione o domínio em
*Authentication → Settings → Authorized domains* no console do Firebase, senão
o login com Google falha em produção.

## Recorrências

Conta que se repete — internet, aluguel, assinatura — vira uma regra em
`users/{uid}/recurrences`: valor, dia do mês, intervalo (mensal a anual), mês
inicial e mês final opcional.

O cadastro é o mesmo do lançamento comum: o `+` pergunta primeiro **despesa ou
receita**, e o compositor abre com uma aba no topo entre **Único** (padrão) e
**Recorrente** — cada uma desenha só os campos que precisa. Como o tipo já foi
escolhido no `+`, ele não se repete como controle na tela: quem o mostra é o
título (*Nova despesa*, *Receita recorrente*). Editar inverte as duas coisas —
sem a aba, porque o que já foi salvo é de um tipo ou de outro e converter seria
apagar um para criar o outro; e **com** o controle de despesa/receita, porque
ali não houve o passo do `+` e sem ele não haveria como corrigir o tipo.

Receita recorrente é o mesmo mecanismo com outra fala: salário projeta em todo
mês como **a receber** e você marca como recebida quando cai. Receita e despesa
nunca entram no mesmo total — `billTotals` devolve as duas separadas, e o
início lista *Contas a pagar* e *A receber* em seções próprias.

**A ocorrência não é gerada, é derivada.** Nada é gravado por mês: a regra
responde por todos eles de uma vez, passados e futuros, e a tela monta a lista
na hora (`billsOfMonth`). Abrir maio de 2027 mostra a conta de maio de 2027 sem
que nada tenha nascido para isso.

O único fato guardado é o **pagamento**, e ele é o lançamento comum carregando
`recurrenceId`. Uma ocorrência está paga quando existe um lançamento daquela
regra naquele mês — é essa a definição, não uma flag à parte. Disso decorre:

- **marcar como paga é lançar**, com a data do vencimento da ocorrência, não a
  de hoje: quitar em setembro a conta de março tem de pesar em março, senão o
  acerto de quem ficou meses fora reescreveria o mês em que ele voltou;
- **desfazer é apagar** aquele lançamento, e a conta volta ao aberto;
- **o valor pago manda.** Luz e água chegam diferentes do previsto, então a
  conta paga vale o que saiu; a regra só dá o palpite inicial;
- **as somas do app não mudaram.** Resumo, quebra por categoria e por origem
  continuam lendo `transactions` — o que está em aberto é previsão e aparece
  separado, nunca dentro do saldo do mês.

Quem passou seis meses fora encontra as seis em aberto numa lista só, no início
(`openBills`), e acerta em seis toques em vez de seis navegações. Pausar uma
regra a tira de todos os meses; `endMonth` encerra a série.

Dia 31 numa recorrência cai no último dia dos meses curtos, pelo mesmo motivo
que o vencimento da fatura cai (`dayInMonthIso`).

Nada disso precisa de servidor: não há geração agendada para atrasar, e por
isso não há cron nem Cloud Function no projeto. O dia em que precisar de um
será por notificação (*"sua internet vence amanhã"*), que é o que o cliente
não consegue fazer — e não por causa das contas em si.

## Dois tipos de cartão

`CreditCard.kind` separa **crédito** de **alimentação**. São o mesmo objeto
porque são a mesma escolha na hora de lançar; o que muda é o que cada um
responde.

| | Crédito | Alimentação |
|---|---|---|
| Configura | limite, fechamento, vencimento | saldo |
| Compra gera | parcela, que entra numa fatura | nada — sai do saldo |
| A tela mostra | limite usado e fatura aberta | quanto sobrou |

O saldo é **derivado, não guardado e mutado**: `balanceCents` é o que a pessoa
informou e `balanceSince` quando informou, e o saldo de agora é a diferença
para as despesas lançadas daquela data em diante. Editar cor ou nome não
reinicia nada: só mexer no próprio saldo move `balanceSince`.

Informar o saldo é manual e mensal **de propósito**. O valor do vale muda de um
mês para o outro, então não há regra que o app pudesse aplicar sozinho sem
inventar um número — virou o mês, a pessoa digita o que entrou e a contagem
recomeça dali. Como o valor informado é o que o app do cartão mostra naquele
dia, o que foi gasto antes já está embutido nele, e a conta se autocorrige.

**O saldo pode ficar negativo.** Gastar mais do que havia é justamente o que
precisa aparecer, e um saldo preso em zero esconderia o estouro — a tela mostra
o negativo em vermelho. (No cartão de crédito, o disponível segue com piso em
zero: estourar limite é outra conversa, e não foi mexido.)

Guardar um número e ir subtraindo dele a cada compra pareceria mais direto, mas
uma edição, uma exclusão ou uma gravação repetida pela fila offline sairiam do
lugar sem ninguém perceber. Derivar é a mesma escolha feita na fatura e nas
contas recorrentes.

Alimentação não tem parcela nem data de pagamento: os dois campos somem do
formulário quando o cartão escolhido é desse tipo, e `syncInstallments` ignora
o cartão mesmo que algo chegue lá por outro caminho. O item da lista também não
vira link — não há fatura para abrir.

## Duas datas no cartão

Uma compra no cartão tem duas datas que não são a mesma, e o app guarda as duas:

- **`date`** — o dia em que a compra aconteceu. É por ela que o gasto entra no
  mês, na quebra por categoria e por origem.
- **`paymentDate`** — o dia em que o dinheiro sai, ou seja, o vencimento da
  fatura em que ela caiu. Parcelada, é o da primeira: as demais seguem no mesmo
  dia dos meses seguintes.

`paymentDate` é `null` por padrão, e aí quem decide é o fechamento do cartão
sobre a data da compra (`resolveInvoiceMonth`). Preencher é a escolha de quem
comprou na véspera do fechamento e prefere a fatura seguinte — o formulário
oferece as três faturas alcançáveis com o vencimento de cada uma, e um
calendário para qualquer outro dia.

Guardar isso no lançamento, e não só na parcela, é o que faz a escolha
sobreviver a uma edição: `syncInstallments` apaga e reconstrói as parcelas a
cada gravação, então um ajuste que só existisse na parcela seria perdido na
próxima vez que o lançamento fosse editado.

## Abertura

Antes, abrir o app instalado dava uma sequência de telas pretas: o bundle
carregando, depois `AppSignInGate` resolvendo a sessão, depois `AccessGate`
consultando a liberação — as duas últimas desenhavam um retângulo vazio.

Agora existe uma splash só, em dois lugares:

- **no HTML** (`layout.tsx`), servida com a página e portanto pintada antes de
  qualquer script — é ela que cobre o download do bundle. Sai por CSS quando
  `AppSplashDismiss` liga `data-app-ready` no `<html>`, com fade;
- **nas portas**, o mesmo componente `AppSplash`, cobrindo sessão e permissão.

Sendo a mesma imagem, a troca entre uma e outra não aparece. O `background_color`
do manifest é o mesmo `--color-base`, então a splash que o Android gera também
emenda sem pulo de cor.

## Offline

O service worker (`public/sw.js`) serve o documento **do cache primeiro** e
revalida por trás. Antes ele esperava a rede, com teto de 3,5s — numa conexão
ruim isso era tela vazia justamente no trecho em que nada pode ser desenhado,
porque a splash mora dentro do HTML que estava sendo aguardado. O preço da
troca é ver a versão anterior numa abertura e a nova na seguinte.

A entrada da navegação é o **caminho**, sem query: `/transactions?month=…` e
`/transactions` são o mesmo documento, e é assim que o precache já guardava.
Isso mantém a busca RSC do Next (`?_rsc=…`) num endereço próprio — ela devolve
um Flight stream, não HTML, e servir um documento no lugar dela trava o
roteador sem erro capturável.

`platform/scripts/test/service-worker.test.ts` carrega o `sw.js` de verdade num
contexto isolado e trava esse comportamento: cache antes da rede, query string
caindo no mesmo caminho, revalidação gravando a versão nova, RSC nunca pegando
o documento, e a queda para `/` quando falta rede e cópia local.

O IndexedDB `finflow-offline` guarda um espelho das coleções e uma fila de
mutações (outbox). Toda escrita entra no espelho na hora e é enfileirada; a fila
é descarregada em ordem quando há rede — ao abrir o app, ao voltar a conexão e
depois de cada gravação. O indicador no topo mostra quantos lançamentos ainda
faltam subir.

## Task Flow

O desenvolvimento é guiado por `.task-flow/` (RBIN Task Flow). Veja `CLAUDE.md`.

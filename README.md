# FinFlow

PWA de gestão de gastos e receitas pessoais. Next.js 15 (App Router) + Firebase
(Auth Google + Firestore), offline-first, deploy na Vercel.

## O que o app faz

- Cadastro rápido de despesa e receita: valor, categoria, forma de pagamento e data em poucos toques.
- Formas de pagamento: PIX, cartão, débito, dinheiro e boleto.
- Cartões com limite, dia de fechamento e dia de vencimento.
- Parcelamento no cartão com alocação automática das parcelas nas faturas.
- Ajuste do dia de pagamento de uma parcela, movendo-a de fatura.
- Categorias de despesa e de receita, com cor e ícone.
- **Offline-first**: tudo é gravado no aparelho e sobe sozinho quando a conexão volta.

## Estrutura

```
src/
├── app/        # Rotas — wrappers finos das páginas de feature
├── features/   # Domínio: platform, offline, ledger, categories, cards,
│               # transactions, invoices, dashboard, settings
└── shared/     # Reuso entre features (componentes, utils, libs, config)
```

## Comandos

### Desenvolvimento

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Sobe o app em `localhost:3000` |
| `pnpm build` | Build de produção |
| `pnpm lint` / `pnpm lint:fix` | ESLint (`@rbinflow/eslint-config`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Testes de `platform/scripts/test/` |

### Ambiente

Três arquivos espelhados, mesmas chaves em ordem alfabética:
`.env.example` (commitado, vazio), `.env.local` (dev), `.env.production` (Vercel).

| Comando | O que faz |
|---------|-----------|
| `pnpm env:check` | Confere se os três arquivos têm as mesmas chaves, na mesma ordem |
| `pnpm env:sync` | Envia `.env.production` para a Vercel (ambiente `production`) |
| `pnpm env:sync:preview` | Envia `.env.local` para o ambiente `preview` |

`DRY_RUN=1 pnpm env:sync` mostra o que seria enviado sem enviar nada.
`NEXT_PUBLIC_*` sobe como plaintext; o resto sobe como secret.

### Deploy

| Comando | O que faz |
|---------|-----------|
| `pnpm deploy` | Deploy de produção na Vercel |
| `pnpm deploy:preview` | Deploy de preview |
| `pnpm firebase:rules` | Publica `firestore.rules` e `firestore.indexes.json` |

Primeira vez em uma máquina nova: `vercel link` e `firebase login`.

## Firebase

Projeto `finflow-785df`. Cada conta lê e escreve apenas `users/{uid}` — não há
papel de administrador. As regras estão em `firestore.rules`, os índices em
`firestore.indexes.json`.

Coleções por usuário: `categories`, `cards`, `transactions`, `installments`.

## Offline

O IndexedDB `finflow-offline` guarda um espelho das coleções e uma fila de
mutações (outbox). Toda escrita entra no espelho na hora e é enfileirada; a fila
é descarregada em ordem quando há rede — ao abrir o app, ao voltar a conexão e
depois de cada gravação. O indicador no topo mostra quantos lançamentos ainda
faltam subir.

## Task Flow

O desenvolvimento é guiado por `.task-flow/` (RBIN Task Flow). Veja `CLAUDE.md`.

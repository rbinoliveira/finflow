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
│               # transactions, invoices, dashboard, settings
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

- `members/{uid}` — quem pode entrar. Decisão do admin.
- `users/{uid}/{categories,cards,transactions,installments}` — os dados de cada
  conta. Nem o admin lê os lançamentos de outra pessoa.

O e-mail do admin aparece em dois lugares que precisam andar juntos:
`ADMIN_EMAIL` em `src/features/access/constants/access.constants.ts` e
`isAdmin()` em `firestore.rules`.

**Domínios autorizados:** ao publicar na Vercel, adicione o domínio em
*Authentication → Settings → Authorized domains* no console do Firebase, senão
o login com Google falha em produção.

## Offline

O IndexedDB `finflow-offline` guarda um espelho das coleções e uma fila de
mutações (outbox). Toda escrita entra no espelho na hora e é enfileirada; a fila
é descarregada em ordem quando há rede — ao abrir o app, ao voltar a conexão e
depois de cada gravação. O indicador no topo mostra quantos lançamentos ainda
faltam subir.

## Task Flow

O desenvolvimento é guiado por `.task-flow/` (RBIN Task Flow). Veja `CLAUDE.md`.

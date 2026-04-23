# Nexlabel — CLAUDE.md

## Visão geral do projeto

Nexlabel é uma aplicação web SaaS que permite ao usuário fazer upload de planilhas Excel (.xlsx) contendo códigos internos de produtos e gerar QR Codes para cada produto automaticamente. O sistema possui autenticação de usuários, banco de dados e cobrança por assinatura.

---

## Stack tecnológica

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Banco de dados + Autenticação:** Supabase
- **Hospedagem:** Vercel
- **Leitura de Excel:** SheetJS (xlsx)
- **Geração de QR Code:** qrcode (biblioteca npm)
- **Pagamento:** Mercado Pago (API de assinaturas)
- **Estilização:** Tailwind CSS

---

## Estrutura do projeto

```
nexlabel/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── history/
│   │       └── page.tsx
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts       ← recebe planilha, processa e salva
│   │   ├── qrcode/
│   │   │   └── route.ts       ← gera QR code por código de produto
│   │   └── payment/
│   │       └── route.ts       ← integração Mercado Pago
│   ├── layout.tsx
│   └── page.tsx               ← landing page
├── components/
│   ├── UploadSheet.tsx         ← componente de upload da planilha
│   ├── QRCodeGrid.tsx          ← exibe grade de QR codes gerados
│   ├── ProductTable.tsx        ← tabela de produtos da planilha
│   └── Navbar.tsx
├── lib/
│   ├── supabase.ts             ← cliente Supabase
│   ├── sheetParser.ts          ← lógica de leitura do Excel
│   └── qrGenerator.ts         ← lógica de geração de QR code
├── types/
│   └── index.ts                ← tipos TypeScript do projeto
├── .env.local                  ← variáveis de ambiente (nunca subir pro GitHub)
└── CLAUDE.md                   ← este arquivo
```

---

## Variáveis de ambiente (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://yhhuwhegtghieuavgozj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta_aqui
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercado_pago_aqui
```

---

## Banco de dados (Supabase)

### Tabela: `profiles`
Armazena dados do usuário após o cadastro.

```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  email text,
  name text,
  plan text default 'free',  -- 'free' | 'pro'
  created_at timestamp default now(),
  primary key (id)
);
```

### Tabela: `uploads`
Registra cada planilha enviada pelo usuário.

```sql
create table uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  filename text,
  total_products int,
  created_at timestamp default now()
);
```

### Tabela: `products`
Armazena os produtos extraídos de cada planilha.

```sql
create table products (
  id uuid default gen_random_uuid() primary key,
  upload_id uuid references uploads(id) on delete cascade,
  code text not null,         -- código interno do produto
  name text,                  -- nome do produto (se houver na planilha)
  qr_url text,                -- URL/dados do QR code gerado
  created_at timestamp default now()
);
```

---

## Fluxo principal da aplicação

1. Usuário faz login ou cadastro via Supabase Auth
2. Faz upload de uma planilha `.xlsx`
3. O backend lê a planilha com SheetJS e extrai os códigos de produto
4. Para cada código, gera um QR code com a biblioteca `qrcode`
5. Os produtos e QR codes são salvos no Supabase
6. O usuário visualiza e pode baixar os QR codes gerados
7. Usuário com plano free tem limite de produtos por mês
8. Para aumentar o limite, faz upgrade via Mercado Pago

---

## Formato esperado da planilha Excel

A planilha deve ter pelo menos uma coluna com os códigos de produto. Exemplo:

| CODIGO | NOME |
|--------|------|
| 001234 | Produto A |
| 005678 | Produto B |

O sistema deve aceitar variações no nome da coluna (ex: "CODIGO", "COD", "CODE", "Código").

---

## Regras importantes

- O arquivo `.env.local` **nunca deve ser commitado** no GitHub. Adicionar ao `.gitignore`.
- A chave `SUPABASE_SERVICE_ROLE_KEY` só deve ser usada em rotas de API (server-side), nunca no client.
- O QR code gerado deve conter **somente o código do produto**, não uma URL.
- Usar **Row Level Security (RLS)** no Supabase para garantir que cada usuário só acesse seus próprios dados.
- O projeto deve ser responsivo para funcionar bem no celular (PWA futuramente).

---

## Comandos úteis

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Instalar bibliotecas do projeto
npm install @supabase/supabase-js xlsx qrcode
npm install -D @types/qrcode
```

---

## Próximos passos (ordem de desenvolvimento)

1. [ ] Criar projeto Next.js com `npx create-next-app@latest nexlabel`
2. [ ] Configurar Supabase (criar tabelas, ativar Auth)
3. [ ] Implementar login e cadastro
4. [ ] Implementar upload e leitura da planilha Excel
5. [ ] Implementar geração de QR codes
6. [ ] Tela de visualização e download dos QR codes
7. [ ] Integrar Mercado Pago para cobrança
8. [ ] Deploy na Vercel
9. [ ] Configurar PWA (next-pwa)

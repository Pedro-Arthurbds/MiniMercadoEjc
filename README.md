# 🛒 Mini Mercado EJC

Aplicação web para gestão de produtos, comandas, vendas e usuários em um ambiente de mini mercado. O projeto tem um backend em Node.js/Express com Prisma e um frontend em React + TypeScript com Vite.

[![React](https://img.shields.io/badge/React-19.2.6-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15.0-blue?logo=prisma)](https://www.prisma.io/)

---

## Visão geral

O sistema foi pensado para apoiar o fluxo diário de um mini mercado com três pilares principais:

- gestão de produtos e estoque;
- abertura e fechamento de comandas;
- registro de vendas e controle de permissões por perfil.

A aplicação permite que diferentes papéis trabalhem com segurança e responsabilidade:

- ADMIN: gerencia usuários e visualiza dados gerais;
- MINIMERCADO: gerencia produtos, vendas e comandas;
- SECRETARIA: cria e acompanha comandas.

---

## Arquitetura do projeto

```mermaid
flowchart LR
    A[Usuário no frontend React] --> B[Rotas protegidas e autenticação]
    B --> C[API Express / Node.js]
    C --> D[Middleware de autenticação e autorização]
    D --> E[Prisma ORM]
    E --> F[PostgreSQL]
```

O fluxo principal é:

1. o frontend envia requisições para a API;
2. o backend valida dados, autentica o usuário e aplica regras de negócio;
3. o Prisma persiste e consulta os dados no banco;
4. o frontend atualiza a interface com o resultado.

---

## Tecnologias principais

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- bcryptjs para hash de senhas
- Zod para validação de payloads
- CORS para integração com o frontend

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Icons
- QRCode
- React Hot Toast

---

## Funcionalidades principais

- login com autenticação JWT;
- controle de acesso por papéis;
- cadastro e atualização de produtos com estoque;
- registro de vendas com decremento automático de estoque;
- abertura, edição e fechamento de comandas;
- inclusão e remoção de itens de comanda;
- visualização pública de uma comanda via link compartilhável;
- dashboard com visão geral do sistema.

---

## Requisitos

- Node.js 18+
- npm
- PostgreSQL configurado via variável de ambiente

---

## Configuração local

### 1) Clone o repositório

```bash
git clone https://github.com/Pedro-Arthurbds/MiniMercadoEjc.git
cd MiniMercadoEjc
```

### 2) Backend

```bash
cd backend
npm install
```

Crie um arquivo chamado `.env` com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/minimercado"
JWT_SECRET="uma_chave_muito_segura"
NODE_ENV="development"
```

Execute as migrações e gere o cliente Prisma:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3) Frontend

```bash
cd ../frontend
npm install
```

Crie um arquivo `.env` com:

```env
VITE_API_URL=http://localhost:3000
```

---

## Como rodar

### Backend

```bash
cd backend
npm run dev
```

A API fica disponível em `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm run dev
```

A interface fica disponível em `http://localhost:5173`.

---

## Estrutura do projeto

```text
MiniMercadoEjc/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── middlewares/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── docs/
│   ├── api.md
│   ├── backend.md
│   ├── database.md
│   └── frontend.md
├── mkdocs.yml
└── README.md
```

---

## Documentação completa

A documentação técnica detalhada está organizada em:

- [docs/index.md](docs/index.md) — visão geral do sistema e da documentação
- [docs/backend.md](docs/backend.md) — arquitetura e regras do backend
- [docs/database.md](docs/database.md) — modelagem Prisma e relacionamentos
- [docs/frontend.md](docs/frontend.md) — estrutura da interface e rotas
- [docs/api.md](docs/api.md) — referência das rotas da API

Para visualizar a documentação localmente com MkDocs:

```bash
pip install mkdocs-material
mkdocs serve
```

Acesse `http://127.0.0.1:8000`.

---

## Contribuição

Contribuições são bem-vindas. Abra uma issue ou envie um pull request com sua sugestão ou correção.


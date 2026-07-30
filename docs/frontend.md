# Frontend — Mini Mercado EJC

## Visão geral

O frontend é a aplicação React + TypeScript que fornece a interface do usuário para gerenciamento de produtos, comandas e usuários.

### Páginas principais

- `/login` — página de login
- `/` — dashboard
- `/products` — gerenciamento de produtos
- `/commands` — listagem de comandas
- `/commands/:id` — detalhes da comanda
- `/users` — administração de usuários
- `/c/:code` — visualização pública de comanda

## Arquitetura

- `src/App.tsx` — define rotas e rotas protegidas
- `src/contexts/AuthContext.tsx` — gerencia autenticação e permissões
- `src/services/api.ts` — configura Axios e token JWT
- `src/components/ProtectedRoute.tsx` — protege rotas privadas
- `src/pages/` — páginas da aplicação
- `src/components/` — componentes reutilizáveis

## Autenticação

- O usuário realiza login em `/login`.
- O token JWT é salvo em `localStorage`.
- O `api.ts` envia o token em `Authorization` para todas as requisições.
- `AuthContext` valida o token em `/auth/me`.
- `ProtectedRoute` bloqueia acesso não autorizado.

## Permissões

- `ADMIN` — acesso total, incluindo gerenciamento de usuários.
- `MINIMERCADO` — gerenciamento de produtos, vendas e comandas.
- `SECRETARIA` — criação de comandas.

## Componentes importantes

### `ProductsPage`

- Obtém produtos via `GET /products`
- Filtra produtos por nome e categoria
- Exibe indicadores de estoque
- Permite criar produto para papel `MINIMERCADO`

### `CommandsPage`

- Obtém comandas via `GET /commands`
- Filtra comandas abertas, fechadas e por nome do cliente
- Permite abrir nova comanda via modal

### `CommandDetailsPage`

- Obtém comanda via `GET /commands/:id`
- Adiciona item via `POST /command-items`
- Fecha comanda via `PUT /commands/:id/close`
- Gera QR Code para acesso público

### `UsersPage`

- Lista usuários via `GET /users`
- Cria e edita usuários via `/users`
- Remove usuários
- Disponível apenas para papel `ADMIN`

## Configuração de ambiente

Crie `frontend/.env` com:

```env
VITE_API_URL=http://localhost:3000
```

## Dependências principais

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Icons
- qrcode
- react-hot-toast

## Como executar

```bash
cd frontend
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

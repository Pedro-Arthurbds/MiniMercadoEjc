# Backend — Mini Mercado EJC

## Visão geral

O backend é a API REST responsável por:

- receber requisições do frontend;
- autenticar usuários com JWT;
- validar dados com Zod;
- controlar o acesso por papéis (ADMIN, MINIMERCADO, SECRETARIA);
- acessar o banco de dados via Prisma;
- gerenciar produtos, vendas e comandas.

## Estrutura do backend

```bash
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── server.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── validate.js
│   ├── schemas/
│   │   └── schemas.js
│   └── utils/
│       └── auth.js
├── package.json
└── .env
```

## Fluxo de requisição

1. O frontend envia uma requisição HTTP para a API.
2. A API valida o JWT e as permissões.
3. O Zod valida o corpo da requisição.
4. O Prisma executa operações no banco.
5. A API responde com JSON.

## Autenticação e autorização

- `POST /auth/login` autentica um usuário e retorna um token JWT.
- `GET /auth/me` valida o token e retorna o usuário atual.
- O middleware `authenticate` verifica o header `Authorization: Bearer <token>`.
- O middleware `authorize` permite acesso apenas a papéis específicos.
- Usuários `ADMIN` têm acesso total.

## Rotas principais

### Usuários

- `POST /users`: cria usuário (ADMIN)
- `GET /users`: lista usuários (ADMIN)
- `PUT /users/:id`: atualiza usuário (ADMIN)
- `DELETE /users/:id`: remove usuário (ADMIN)

### Produtos

- `GET /products`: lista produtos
- `POST /products`: cria produto (MINIMERCADO)
- `PUT /products/:id`: atualiza produto (MINIMERCADO)
- `DELETE /products/:id`: exclui produto (MINIMERCADO)

### Vendas

- `GET /sales`: lista vendas (ADMIN ou MINIMERCADO)
- `POST /sales`: registra venda e debita estoque (MINIMERCADO)

### Comandas

- `GET /commands`: lista comandas
- `GET /commands/:id`: obtém detalhes da comanda
- `POST /commands`: cria comanda (MINIMERCADO, SECRETARIA)
- `PUT /commands/:id/close`: fecha comanda (MINIMERCADO)
- `GET /c/:code`: visualização pública da comanda

### Itens de comanda

- `POST /command-items`: adiciona item à comanda (MINIMERCADO)
- `DELETE /command-items/:id`: remove item da comanda (MINIMERCADO)

## Validação de dados

O arquivo `backend/src/schemas/schemas.js` define as regras de validação para:

- login
- criação/atualização de usuário
- criação/atualização de produto
- criação de venda
- criação de comanda
- criação de item de comanda

## Banco de dados

O backend usa Prisma para acesso ao banco de dados. O arquivo `backend/prisma/schema.prisma` define os modelos e relações.

### Dependências principais

- `express`
- `cors`
- `dotenv`
- `jsonwebtoken`
- `bcryptjs`
- `@prisma/client`
- `zod`

### Scripts úteis

- `npm run dev` - inicia o servidor com `nodemon`
- `npm start` - gera o cliente Prisma, aplica migrações e inicia o servidor

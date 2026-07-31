# Backend — Mini Mercado EJC

O backend é a camada responsável pela regra de negócio, autenticação, autorização e persistência dos dados. Ele expõe uma API HTTP para que o frontend consiga consumir os recursos do sistema.

## Estrutura principal

```text
backend/
├── prisma/
├── src/
│   ├── middlewares/
│   ├── schemas/
│   ├── utils/
│   └── server.js
└── package.json
```

## Tecnologias do backend

- Node.js: execução do servidor
- Express: criação das rotas e middlewares
- Prisma ORM: acesso ao banco de forma tipada e organizada
- PostgreSQL: banco relacional principal
- JWT: geração e validação de tokens
- bcryptjs: proteção das senhas
- Zod: validação das entradas das rotas

## Arquitetura de funcionamento

O servidor é inicializado em backend/src/server.js. Ele monta:

- middlewares globais, como CORS e leitura de JSON;
- rotas para autenticação, usuários, produtos, vendas e comandas;
- validações antes de executar as operações;
- integração com o Prisma Client para consultar e gravar dados.

## Camadas principais

### 1. Middlewares

Os middlewares garantem segurança e padronização das requisições.

- `authenticate`: valida o token JWT do usuário
- `authorize`: verifica se o usuário possui permissão para executar a ação
- `validate`: valida o payload enviado para a rota

### 2. Serviços / rotas

As rotas estão organizadas por recurso:

- `/auth`: login e validação do usuário atual
- `/users`: cadastro e gestão de usuários
- `/products`: cadastro, listagem e atualização de produtos
- `/sales`: registro de vendas e atualização de estoque
- `/commands`: criação e consulta de comandas
- `/command-items`: adição e remoção de itens nas comandas
- `/c/:code`: rota pública para acessar uma comanda por código

## Regras de negócio

### Autenticação

O login recebe email e senha, valida as credenciais e retorna um token JWT. Esse token é usado nas rotas protegidas.

### Autorização

Os perfis definidos no sistema são:

- ADMIN
- MINIMERCADO
- SECRETARIA

Cada rota pode exigir um ou mais papéis. Exemplo:

- usuários só podem ser criados por ADMIN;
- produtos e vendas são controlados por MINIMERCADO;
- comandas podem ser abertas por MINIMERCADO e SECRETARIA.

### Fluxo de vendas

Quando uma venda é registrada:

1. o produto é localizado;
2. o estoque é validado;
3. a venda é salva no banco;
4. o estoque do produto é reduzido.

### Fluxo de comandas

Ao criar uma comanda, o sistema registra quem abriu a operação. Quando itens são adicionados:

- o estoque é reduzido;
- o total da comanda é atualizado;
- o item recebe o usuário que o adicionou.

Ao fechar a comanda, o status muda para fechado e a data de fechamento é registrada.

## Validação de entradas

As rotas usam o Zod para garantir que os dados recebidos tenham o formato esperado. Isso evita erros de integridade e melhora a segurança do sistema.

## Melhorias de segurança implementadas

- Autenticação por cookie JWT `HttpOnly` para reduzir exposição de tokens em JavaScript.
- Logout via `POST /auth/logout` que limpa o cookie de autenticação.
- Rate limiting de login para mitigar ataques de força bruta.
- Segurança de headers no backend:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`
- Exigência de `JWT_SECRET` em tempo de inicialização, evitando servidores com segredo ausente.
- Validação de payloads com Zod em todas as rotas principais.
- No frontend, o Axios é configurado com `withCredentials: true` para enviar cookies de sessão.
- Foi verificado que não há rotas de file-serving que criem vulnerabilidade de path bypass.
- O projeto não apresenta configurações de Row Level Security (RLS) no Prisma schema ou nas migrações atuais.
## Exemplo de fluxo de execução

```text
POST /auth/login
  -> valida e autentica usuário
  -> gera token JWT
  -> frontend salva token e usuário

GET /products
  -> backend consulta o banco
  -> retorna lista de produtos
```

## Pontos importantes do backend

- o backend centraliza a lógica de negócio;
- ele é responsável por evitar acessos indevidos;
- ele garante que alterações de estoque e valor sejam feitas corretamente;
- ele atua como ponte entre o frontend e o banco de dados.


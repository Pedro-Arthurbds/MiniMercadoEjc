# API — Mini Mercado EJC

A API do Mini Mercado EJC é o núcleo do sistema. Ela recebe as requisições do frontend, valida os dados e executa as operações sobre o banco de dados.

## Visão geral

A API é RESTful e usa JSON para comunicação. As rotas são protegidas por autenticação e, em muitos casos, por autorização baseada em perfil.

## Autenticação

Todas as rotas protegidas exigem um header no formato:

```http
Authorization: Bearer <token>
```

### POST /auth/login

Realiza o login do usuário.

Body:

```json
{
  "email": "admin@example.com",
  "password": "senha123"
}
```

Resposta:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

### GET /auth/me

Retorna o usuário autenticado com base no token enviado.

### PUT /auth/change-password

Altera a senha do usuário autenticado e conclui a exigência de troca no primeiro acesso.

Body:

```json
{
  "password": "minha-nova-senha"
}
```

Resposta:

```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

## Usuários

Os usuários representam as pessoas que acessam o sistema. Cada usuário possui:

> O seed do projeto cria três usuários padrão para facilitar o teste inicial do sistema:
>
> - `admin@minimercado.com` / `123456` com papel `ADMIN`
> - `secretaria@minimercado.com` / `123456` com papel `SECRETARIA`
> - `caixa@minimercado.com` / `123456` com papel `MINIMERCADO`

- `id`: identificador numérico
- `name`: nome completo
- `email`: e-mail único
- `role`: `ADMIN`, `MINIMERCADO` ou `SECRETARIA`
- `mustChangePassword`: indica se o usuário deve escolher uma senha no primeiro acesso

### POST /users

Cria um novo usuário. Requer perfil `ADMIN`.

Body:

```json
{
  "name": "Maria",
  "email": "maria@example.com",
  "password": "senha123",
  "role": "SECRETARIA",
  "mustChangePassword": true
}
```

Quando essa opção é `true`, o usuário entra com a senha provisória e é redirecionado para escolher uma senha pessoal.

Resposta:

```json
{
  "id": 3,
  "name": "Maria",
  "email": "maria@example.com",
  "role": "SECRETARIA"
}
```

### GET /users

Lista os usuários cadastrados. Requer perfil `ADMIN`.

Resposta:

```json
[
  {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "name": "João",
    "email": "joao@example.com",
    "role": "MINIMERCADO"
  }
]
```

### PUT /users/:id

Atualiza um usuário existente. Requer perfil `ADMIN`.

Body:

```json
{
  "name": "Maria Silva",
  "email": "maria.silva@example.com",
  "role": "SECRETARIA",
  "password": "novaSenha123"
}
```

Resposta:

```json
{
  "id": 3,
  "name": "Maria Silva",
  "email": "maria.silva@example.com",
  "role": "SECRETARIA"
}
```

### DELETE /users/:id

Remove um usuário. Requer perfil `ADMIN` e não é permitido remover o próprio usuário autenticado.

## Produtos

### GET /products

Lista os produtos cadastrados.

### POST /products

Cria um novo produto. Requer perfil `MINIMERCADO`.

Body:

```json
{
  "name": "Coca-Cola 2L",
  "category": "Bebidas",
  "price": 8.5,
  "stock": 20
}
```

### PUT /products/:id

Atualiza um produto existente.

### DELETE /products/:id

Exclui um produto do sistema.

## Vendas

### POST /sales

Registra uma venda. Requer perfil `MINIMERCADO`.

Body:

```json
{
  "productId": 1,
  "quantity": 3
}
```

Essa operação:

- valida se há estoque suficiente;
- cria o registro de venda;
- decrementa o estoque do produto.

### GET /sales

Lista as vendas registradas.

## Comandas

### POST /commands

Cria uma nova comanda. Requer perfil `MINIMERCADO` ou `SECRETARIA`.

Body:

```json
{
  "customer": "João"
}
```

### GET /commands

Lista as comandas com seus itens e dados de quem abriu/fechou.

### GET /commands/:id

Retorna os detalhes de uma comanda específica.

### PUT /commands/:id/close

Fecha uma comanda. Requer perfil `MINIMERCADO`.

### GET /c/:code

Rota pública para visualizar uma comanda através de um código compartilhável.

## Itens de comanda

### POST /command-items

Adiciona um produto a uma comanda. Requer perfil `MINIMERCADO`.

Body:

```json
{
  "commandId": 1,
  "productId": 2,
  "quantity": 2
}
```

Essa operação atualiza:

- o estoque do produto;
- o total da comanda;
- o histórico do item adicionado.

### DELETE /command-items/:id

Remove um item da comanda e repõe o estoque.

## Códigos de erro comuns

- `401 Unauthorized`: token ausente ou inválido
- `403 Forbidden`: usuário sem permissão para a ação
- `400 Bad Request`: dados inválidos ou estoque insuficiente
- `404 Not Found`: recurso não encontrado

## Exemplo de uso com curl

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

Esse comando retorna o token que pode ser usado nas outras rotas protegidas.

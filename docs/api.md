# API — Mini Mercado EJC

## Endpoints

### Autenticação

- `POST /auth/login`
  - corpo: `{ email, password }`
  - retorna: `{ token, user: { id, name, role } }`

- `GET /auth/me`
  - cabeçalho: `Authorization: Bearer <token>`
  - retorna: `{ user: { id, name, role } }`

### Usuários

- `POST /users`
  - cabeçalho: `Authorization: Bearer <token>`
  - corpo: `{ name, email, password, role }`
  - papel: `ADMIN`

- `GET /users`
  - papel: `ADMIN`
  - retorna lista de usuários

- `PUT /users/:id`
  - papel: `ADMIN`
  - corpo: `{ name, email, password?, role }`

- `DELETE /users/:id`
  - papel: `ADMIN`

### Produtos

- `GET /products`
  - retorna lista de produtos

- `POST /products`
  - papel: `MINIMERCADO`
  - corpo: `{ name, category, price, stock }`

- `PUT /products/:id`
  - papel: `MINIMERCADO`
  - corpo: `{ name, category, price, stock }`

- `DELETE /products/:id`
  - papel: `MINIMERCADO`

### Vendas

- `GET /sales`
  - papel: `ADMIN` ou `MINIMERCADO`

- `POST /sales`
  - papel: `MINIMERCADO`
  - corpo: `{ productId, quantity }`
  - efeito: desconta `quantity` do estoque do produto

### Comandas

- `GET /commands`
  - retorna comandas com itens e dados de usuários

- `POST /commands`
  - papel: `MINIMERCADO` ou `SECRETARIA`
  - corpo: `{ customer }`

- `GET /commands/:id`
  - retorna comanda com itens, usuário que abriu e usuário que fechou

- `PUT /commands/:id/close`
  - papel: `MINIMERCADO`
  - efeito: marca comanda como fechada e registra `closedAt`

- `GET /c/:code`
  - rota pública
  - retorna dados reduzidos da comanda para compartilhamento

### Itens de comanda

- `POST /command-items`
  - papel: `MINIMERCADO`
  - corpo: `{ commandId, productId, quantity }`
  - efeito: adiciona item, desconta estoque e atualiza `total` da comanda

- `DELETE /command-items/:id`
  - papel: `MINIMERCADO`
  - efeito: remove item, repõe estoque e ajusta `total`

## Erros comuns de validação

- `401 Unauthorized` — token ausente ou inválido
- `403 Forbidden` — papel sem permissão
- `400 Bad Request` — dados inválidos ou estoque insuficiente
- `404 Not Found` — produto, comanda ou item não encontrados

## Exemplo de uso

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

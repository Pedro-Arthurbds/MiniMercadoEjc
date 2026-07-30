# Banco de Dados — Mini Mercado EJC

O banco do projeto é modelado com Prisma e definido no arquivo backend/prisma/schema.prisma.

## Configuração do datasource

O esquema aponta para um banco PostgreSQL usando a variável de ambiente `DATABASE_URL`.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Essa configuração permite que o backend troque dados com um banco relacional de forma organizada, sem escrever SQL manualmente em cada operação.

## Modelos principais

### Product

Representa os produtos disponíveis para venda ou para compor comandas.

```prisma
model Product {
  id        Int      @id @default(autoincrement())
  name      String
  category  String
  price     Float
  stock     Int      @default(0)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  items CommandItem[]
}
```

Campos importantes:

- `name`: nome do produto
- `category`: categoria do item
- `price`: preço unitário
- `stock`: quantidade em estoque
- `active`: indica se o produto está disponível

### Sale

Registra vendas concretizadas pelo sistema.

```prisma
model Sale {
  id        Int      @id @default(autoincrement())
  product   String
  quantity  Int
  total     Float
  createdAt DateTime @default(now())
}
```

Essa tabela funciona como um histórico de vendas, preservando informações essenciais sobre a operação.

### User

Representa os usuários do sistema.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role
  createdAt DateTime @default(now())

  openedCommands Command[]     @relation("OpenedCommands")
  closedCommands Command[]     @relation("ClosedCommands")
  addedItems     CommandItem[] @relation("AddedItems")
}
```

Cada usuário possui um perfil, que define o que pode fazer na aplicação.

### Command

Representa uma comanda aberta ou fechada.

```prisma
model Command {
  id        Int      @id @default(autoincrement())
  customer  String
  total     Float    @default(0)
  createdAt DateTime @default(now())

  items CommandItem[]

  closed   Boolean   @default(false)
  closedAt DateTime?

  publicCode String @unique @default(uuid())

  openedByUserId Int?
  openedBy       User? @relation("OpenedCommands", fields: [openedByUserId], references: [id])

  closedByUserId Int?
  closedBy       User? @relation("ClosedCommands", fields: [closedByUserId], references: [id])
}
```

Um `Command` pode ter vários itens e pode ser acessada publicamente via `publicCode`.

### CommandItem

Representa um produto adicionado a uma comanda.

```prisma
model CommandItem {
  id        Int      @id @default(autoincrement())
  quantity  Int
  createdAt DateTime @default(now())
  paid      Boolean  @default(false)

  command   Command @relation(fields: [commandId], references: [id])
  commandId Int

  product   Product @relation(fields: [productId], references: [id])
  productId Int

  addedByUserId Int?
  addedBy       User? @relation("AddedItems", fields: [addedByUserId], references: [id])
}
```

Essa entidade conecta `Command`, `Product` e `User`, registrando quem adicionou o item e qual quantidade foi incluída.

### Role

```prisma
enum Role {
  ADMIN
  MINIMERCADO
  SECRETARIA
}
```

## Relacionamentos principais

- Um `Command` possui vários `CommandItem`.
- Um `Product` pode aparecer em diversos `CommandItem`.
- Um `User` pode abrir e fechar várias `Command`.
- Um `User` pode registrar vários `CommandItem`.

## Fluxo de dados no banco

- ao criar um produto, ele entra na tabela `Product`;
- ao registrar uma venda, a venda é salva em `Sale` e o estoque do produto é reduzido;
- ao criar uma comanda, a tabela `Command` recebe a operação;
- ao adicionar itens, a tabela `CommandItem` registra a relação entre produto e comanda.

## Comandos Prisma úteis

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

Esses comandos servem para aplicar mudanças no schema, gerar o cliente e abrir uma visão visual do banco, respectivamente.

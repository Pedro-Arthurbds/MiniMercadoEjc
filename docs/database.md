# Banco de Dados — Mini Mercado EJC

O projeto usa Prisma ORM para modelar o banco de dados e fazer consultas em JavaScript.

## Configuração

O arquivo `backend/prisma/schema.prisma` define o datasource e os modelos.

- `provider = "postgresql"`
- `url = env("DATABASE_URL")`

O banco é configurado com a variável de ambiente `DATABASE_URL`.

## Modelos

### Product

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

### Sale

```prisma
model Sale {
  id        Int      @id @default(autoincrement())
  product   String
  quantity  Int
  total     Float
  createdAt DateTime @default(now())
}
```

### User

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

### Command

```prisma
model Command {
  id            Int      @id @default(autoincrement())
  customer      String
  total         Float    @default(0)
  createdAt     DateTime @default(now())
  closed        Boolean  @default(false)
  closedAt      DateTime?
  publicCode    String   @unique @default(uuid())
  openedByUserId Int?
  openedBy       User?    @relation("OpenedCommands", fields: [openedByUserId], references: [id])
  closedByUserId Int?
  closedBy       User?    @relation("ClosedCommands", fields: [closedByUserId], references: [id])
  items         CommandItem[]
}
```

### CommandItem

```prisma
model CommandItem {
  id            Int      @id @default(autoincrement())
  quantity      Int
  createdAt     DateTime @default(now())
  paid          Boolean  @default(false)
  commandId     Int
  command       Command  @relation(fields: [commandId], references: [id])
  productId     Int
  product       Product  @relation(fields: [productId], references: [id])
  addedByUserId Int?
  addedBy       User?     @relation("AddedItems", fields: [addedByUserId], references: [id])
}
```

### Role

```prisma
enum Role {
  ADMIN
  MINIMERCADO
  SECRETARIA
}
```

## Relacionamentos

- Um `Command` possui muitos `CommandItem`.
- Um `Product` pode aparecer em muitos `CommandItem`.
- Um `User` pode abrir e fechar várias `Command`.
- Um `User` pode adicionar vários `CommandItem`.

## Scripts Prisma

- `npx prisma migrate dev --name init` — criar/migrar tabelas no banco
- `npx prisma generate` — gerar o client Prisma
- `npx prisma studio` — abrir interface visual do banco

## Como funciona no backend

- `Product` representa itens em estoque.
- `Sale` registra vendas concluídas.
- `Command` representa uma comanda aberta ou fechada.
- `CommandItem` representa itens adicionados à comanda.
- `publicCode` permite acesso público a comandas sem login.

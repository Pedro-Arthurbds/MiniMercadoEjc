# Backend — Mini Mercado EJC

## O que é o backend

O backend é a parte responsável por:

* receber requisições
* processar dados
* acessar o banco
* devolver respostas

No projeto do Mini Mercado, o backend foi feito usando:

* Node.js
* Express
* Prisma ORM
* SQLite

---

# Estrutura inicial

```bash
backend/
│
├── prisma/
├── src/
│   └── server.js
├── package.json
└── .env
```

---

# Node.js

## O que aprendi

Node.js permite executar JavaScript fora do navegador.

Com ele conseguimos:

* criar APIs
* acessar banco de dados
* criar servidores
* trabalhar com backend

---

# Express

## O que é

Express é um framework para criar servidores e APIs.

Instalação:

```bash
npm install express
```

---

# Criando servidor

```js
const express = require("express")

const app = express()

app.listen(3000, () => {
  console.log("Servidor rodando")
})
```

## O que entendi

* express() cria a aplicação
* app.listen inicia o servidor
* porta 3000 é onde a API fica disponível

---

# Rotas

## GET

Usado para buscar dados.

```js
app.get("/products", (req, res) => {
  res.send("Lista de produtos")
})
```

---

## POST

Usado para criar dados.

```js
app.post("/products", (req, res) => {
  res.send("Produto criado")
})
```

---

# JSON

## O que aprendi

APIs normalmente trabalham usando JSON.

Exemplo:

```json
{
  "nome": "Coca-Cola",
  "preco": 10
}
```

---

# Middleware

```js
app.use(express.json())
```

## O que faz

Permite o Express entender JSON enviado pelo frontend.

Sem isso:

```js
req.body
```

fica undefined.

---

# Prisma ORM

## O que é

Prisma é uma ORM.

ORM significa:

Object Relational Mapping.

Ele facilita acessar o banco usando JavaScript.

---

# Instalação Prisma

```bash
npm install prisma @prisma/client
```

---

# Inicialização

```bash
npx prisma init
```

Isso cria:

```bash
prisma/
.env
```

---

# Generate

```bash
npx prisma generate
```

## O que aprendi

Esse comando cria o Prisma Client.

Sem isso o backend não consegue acessar o banco.

---

# Migration

```bash
npx prisma migrate dev --name init
```

## O que aprendi

Migration cria as tabelas no banco.

---

# Prisma Client

```js
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
```

---

# Buscar produtos

```js
const produtos = await prisma.produto.findMany()
```

---

# Criar produto

```js
await prisma.produto.create({
  data: {
    nome: "Coca-Cola",
    preco: 10,
    estoque: 20
  }
})
```

---

# Erros que enfrentei

## Cannot POST /products

### Causa

A rota POST não existia.

### Solução

Criar:

```js
app.post("/products")
```

---

## Cannot find module '.prisma/client/default'

### Causa

Prisma Client não foi gerado corretamente.

### Solução

* remover configurações antigas
* usar Prisma 6
* rodar:

```bash
npx prisma generate
```

---

# O que aprendi até agora

* criar servidor
* criar API
* usar Express
* usar Prisma
* criar banco
* criar migrations
* usar JSON
* criar rotas
* conectar backend ao banco

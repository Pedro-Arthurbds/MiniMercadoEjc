 Banco de Dados — Mini Mercado EJC

## O que é banco de dados

Banco de dados é onde as informações ficam armazenadas.

No Mini Mercado, o banco guarda:

* produtos
* preços
* estoque
* informações futuras do sistema

---

# SQLite

## O que é

SQLite é um banco leve baseado em arquivo.

Foi escolhido porque:

* é simples
* fácil para iniciantes
* não precisa instalar servidor

---

# Schema

## O que é

Schema define a estrutura do banco.

Exemplo:

```prisma
model Produto {
  id        Int      @id @default(autoincrement())
  nome      String
  preco     Float
  estoque   Int
  createdAt DateTime @default(now())
}
```

---

# Campos

## O que aprendi

### Int

Número inteiro.

### String

Texto.

### Float

Número decimal.

### DateTime

Data e hora.

---

# Primary Key

```prisma
@id
```

Identificador único.

---

# Autoincrement

```prisma
@default(autoincrement())
```

O ID aumenta automaticamente.

---

# Banco relacional

## O que aprendi

Banco relacional organiza dados em tabelas.

Exemplo:

| id | nome | preco |
| -- | ---- | ----- |
| 1  | Coca | 10    |

---

# Migration

## O que faz

Transforma o schema em tabelas reais.

Comando:

```bash
npx prisma migrate dev --name init
```

---

# Prisma Studio

```bash
npx prisma studio
```

## O que é

Interface visual do banco.

Permite:

* ver dados
* editar dados
* adicionar registros

---

# Fluxo do sistema

```text
Frontend → Backend → Prisma → Banco de Dados
```

---

# O que aprendi até agora

* criar banco
* criar tabelas
* criar models
* usar Prisma
* usar migrations
* armazenar dados
* entender relações entre backend e banco
* usar SQLite


Prisma é uma ferramenta que permite
acessar banco usando JavaScript
sem escrever SQL manualmente.
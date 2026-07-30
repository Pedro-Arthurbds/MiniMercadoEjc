# 🛒 Mini Mercado EJC

> Aplicação web para gestão de produtos, comandas e vendas em mini mercados.

[![React](https://img.shields.io/badge/React-19.2.6-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15.0-blue?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## 📋 Sumário

- [Sobre](#sobre)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Instalação](#-instalação)
- [Como rodar](#-como-rodar)
- [Rotas da API](#-rotas-da-api)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Documentação adicional](#-documentação-adicional)

---

## Sobre

Mini Mercado EJC é um sistema completo para controle de estoque, vendas e comandas. O projeto foi desenvolvido com um backend em Node.js/Express e um frontend em React/TypeScript.

A aplicação permite:

- cadastro e edição de produtos;
- abertura e fechamento de comandas;
- adição e remoção de itens de comandas;
- controle de estoque e registros de venda;
- autenticação com JWT e perfil de permissões.

---

## 🛠 Tecnologias

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL (via `DATABASE_URL`)
- JWT para autenticação
- bcryptjs para hash de senhas
- CORS
- Zod para validação de payloads

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

## ✨ Funcionalidades

- Autenticação de usuários com JWT
- Controle de acesso por papéis: `ADMIN`, `MINIMERCADO`, `SECRETARIA`
- Gestão de produtos com estoque e categorias
- Registro de vendas com decremento automático de estoque
- Criação e fechamento de comandas
- Adição, remoção e pagamento de itens em comandas
- Visualização pública de comanda via código (`/c/:code`)
- Dashboard com indicadores e filtros
- Validação de dados no backend com Zod

---

## 📦 Instalação

### Requisitos

- Node.js 18+
- npm
- PostgreSQL ou outro banco compatível com `DATABASE_URL`

### Passos

```bash
git clone https://github.com/seu-usuario/MiniMercadoEjc.git
cd MiniMercadoEjc
```

#### Backend

```bash
cd backend
npm install
```

Crie o arquivo `backend/.env` com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/minimercado"
JWT_SECRET="sua_chave_secreta_aqui"
NODE_ENV="development"
```

Execute as migrações e gere o cliente Prisma:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Frontend

```bash
cd ../frontend
npm install
```

Crie o arquivo `frontend/.env` com a URL da API:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Como rodar

### Backend

```bash
cd backend
npm run dev
```

A API roda em `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm run dev
```

A interface roda em `http://localhost:5173`.

---

## 🔌 Rotas da API

### Autenticação

- `POST /auth/login` — faz login e retorna token JWT
- `GET /auth/me` — obtém o usuário autenticado

### Usuários

- `POST /users` — cria um usuário (ADMIN)
- `GET /users` — lista usuários (ADMIN)
- `PUT /users/:id` — atualiza usuário (ADMIN)
- `DELETE /users/:id` — exclui usuário (ADMIN)

### Produtos

- `GET /products` — lista produtos
- `POST /products` — cria produto (MINIMERCADO)
- `PUT /products/:id` — atualiza produto (MINIMERCADO)
- `DELETE /products/:id` — deleta produto (MINIMERCADO)

### Vendas

- `GET /sales` — lista vendas
- `POST /sales` — registra venda e atualiza estoque (MINIMERCADO)

### Comandas

- `GET /commands` — lista comandas
- `POST /commands` — cria comanda (MINIMERCADO, SECRETARIA)
- `GET /commands/:id` — obtém detalhes da comanda
- `PUT /commands/:id/close` — fecha comanda (MINIMERCADO)
- `GET /c/:code` — visualização pública de comanda

### Itens de comanda

- `POST /command-items` — adiciona item à comanda (MINIMERCADO)
- `DELETE /command-items/:id` — remove item da comanda (MINIMERCADO)

---

## 📁 Estrutura do projeto

```
MiniMercadoEjc/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── server.js
│   │   ├── middlewares/
│   │   ├── schemas/
│   │   └── utils/
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
└── README.md
```

---

## 📘 Documentação adicional

- `docs/api.md` — endpoints da API e exemplos
- `docs/backend.md` — arquitetura do backend
- `docs/database.md` — schema Prisma e modelos
- `docs/frontend.md` — navegação e páginas do frontend

---

## 🤝 Contribuindo

Contribuições são bem-vindas. Abra uma issue ou pull request com a melhoria desejada.


| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registra novo usuário |
| POST | `/auth/login` | Faz login e retorna JWT |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido por [Pedro Arthur](https://github.com/Pedro-Arthurbds)

---

## 📞 Suporte

Tem dúvidas ou encontrou um bug? Abra uma [issue](https://github.com/Pedro-Arthurbds/MiniMercadoEjc/issues).

---

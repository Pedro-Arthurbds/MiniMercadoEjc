# 🛒 Mini Mercado EJC

> Um sistema completo de gerenciamento de produtos e comandas para mini mercados, construído com tecnologias modernas.

[![React](https://img.shields.io/badge/React-19.2.6-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## 📋 Tabela de Conteúdos

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Rodar](#-como-rodar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Contribuindo](#-contribuindo)

---

## 📝 Sobre o Projeto

O Mini Mercado EJC é uma aplicação web completa para gerenciamento de produtos, vendas e comandas, desenvolvida inicialmente para atender às necessidades do encontro EJC (Encontro de Jovens com Cristo).

O sistema foi projetado com foco em simplicidade, organização e eficiência operacional, mas é flexível e adaptável, podendo ser facilmente ajustado para outros tipos de estabelecimentos comerciais, como mercados, cantinas, bares ou pequenos comércios.

🎯 Objetivo
Automatizar o controle de produtos e estoque
Facilitar o registro de comandas e vendas
Melhorar a organização do atendimento
Reduzir erros manuais no processo de vendas:

---

## 🛠 Tecnologias

### Frontend
- **React 19** - Biblioteca JavaScript para UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server ultra rápido
- **Tailwind CSS** - Framework de estilos utilitários
- **React Router** - Roteamento de páginas
- **Axios** - Cliente HTTP
- **React Icons** - Ícones vetoriais
- **QR Code** - Geração de códigos QR
- **React Hot Toast** - Notificações elegantes

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - ORM para banco de dados
- **PostgreSQL/SQLite** - Banco de dados
- **JWT** - Autenticação por tokens
- **bcryptjs** - Criptografia de senhas
- **CORS** - Controle de origem cruzada

---

## ✨ Funcionalidades

- ✅ Autenticação e autorização com JWT
- ✅ Gerenciamento de produtos com estoque
- ✅ Sistema de comandas para vendas
- ✅ Dashboard com estatísticas
- ✅ Detalhes de comandas
- ✅ Geração de QR Code para produtos
- ✅ Interface responsiva e intuitiva
- ✅ Validação de dados no backend

---

## 📦 Pré-requisitos

Você precisa ter instalado:

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

---

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/MiniMercadoEjc.git
cd MiniMercadoEjc
```

### 2. Instalar dependências do Backend

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/minimercado"
JWT_SECRET="sua_chave_secreta_aqui"
NODE_ENV="development"
```

### 4. Configurar o banco de dados

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Instalar dependências do Frontend

```bash
cd ../frontend
npm install
```

---

## 🎯 Como Rodar

### Rodar Backend (desenvolvimento)

```bash
cd backend
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Rodar Frontend (desenvolvimento)

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para produção

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
npm start
```

---

## 📁 Estrutura do Projeto

```
MiniMercadoEjc/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema do banco de dados
│   │   ├── seed.js            # Dados iniciais
│   │   └── migrations/         # Histórico de migrações
│   ├── src/
│   │   ├── server.js          # Entrada principal
│   │   ├── middleware/
│   │   │   └── auth.js        # Middleware de autenticação
│   │   └── utils/
│   │       └── auth.js        # Funções de autenticação
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── services/          # Chamadas à API
│   │   ├── contexts/          # Context API
│   │   └── assets/            # Imagens e recursos
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docs/                       # Documentação
├── README.md
└── package.json
```

---

## 🔌 API Endpoints

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/products` | Lista todos os produtos |
| POST | `/products` | Cria um novo produto |
| GET | `/products/:id` | Obtém produto por ID |
| PUT | `/products/:id` | Atualiza um produto |
| DELETE | `/products/:id` | Deleta um produto |

### Comandas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/commands` | Lista todas as comandas |
| POST | `/commands` | Cria uma nova comanda |
| GET | `/commands/:id` | Obtém comanda por ID |
| PUT | `/commands/:id` | Atualiza uma comanda |
| DELETE | `/commands/:id` | Deleta uma comanda |

### Autenticação

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

**Feito com ❤️ por [Pedro Arthur](https://github.com/Pedro-Arthurbds)**
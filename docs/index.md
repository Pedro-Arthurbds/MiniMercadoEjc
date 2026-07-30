# Mini Mercado EJC

Esta documentação reúne a visão completa do sistema Mini Mercado EJC, desde a arquitetura até o fluxo de negócio do dia a dia.

## O que é o sistema

O projeto é uma aplicação web para controlar:

- produtos e estoque;
- vendas;
- comandas abertas e fechadas;
- usuários e permissões.

Ele foi criado para funcionar como uma solução prática para o gerenciamento operacional de um mini mercado, com uma interface web para funcionários e uma API segura para persistir os dados.

## Arquitetura geral

O projeto é dividido em duas camadas principais:

- backend: responsável por autenticação, regras de negócio, validação e acesso ao banco;
- frontend: responsável pela interface e pela interação do usuário.

A comunicação entre as camadas acontece via HTTP, usando JSON como formato de troca de dados.

## Tecnologias utilizadas

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT + bcryptjs
- Zod

### Frontend

- React + TypeScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS

## Fluxo de funcionamento

1. O usuário acessa a interface web.
2. O frontend envia requisições para a API.
3. O backend valida os dados e aplica as permissões.
4. O Prisma grava ou consulta os registros no banco.
5. A interface atualiza a tela com as informações retornadas.

## Organização da documentação

- Backend: arquitetura, rotas e regras de negócio
- Database: modelagem Prisma e relacionamentos
- Frontend: estrutura da interface e navegação
- API: endpoints e exemplos de uso

## Como visualizar a documentação

Instale o MkDocs Material:

```bash
pip install mkdocs-material
```

Depois, rode:

```bash
mkdocs serve
```

A documentação ficará disponível em:

```text
http://127.0.0.1:8000
```

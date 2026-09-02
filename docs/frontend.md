# Frontend — Mini Mercado EJC

O frontend é a camada visual do sistema. Ele oferece uma interface para que os usuários consigam operar o mini mercado com segurança, navegação simples e feedback visual.

## Estrutura da aplicação

A organização principal está em frontend/src:

- `components/`: componentes reutilizáveis como cards, formulários e navegação
- `contexts/`: contexto global de autenticação
- `pages/`: páginas principais da aplicação
- `services/`: configuração do cliente HTTP com Axios
- `App.tsx`: definição das rotas e proteção de acesso

## Principais rotas

- `/login`: tela de acesso
- `/`: dashboard principal
- `/products`: gestão de produtos
- `/commands`: listagem e criação de comandas
- `/commands/:id`: detalhes de uma comanda
- `/users`: gestão de usuários
- `/change-password`: troca obrigatória de senha no primeiro acesso
- `/c/:code`: visualização pública de uma comanda

## Autenticação no frontend

A autenticação é feita com JWT e contexto React.

- o usuário faz login na tela `/login`;
- o token é salvo no `localStorage`;
- o cliente Axios adiciona o token automaticamente ao header `Authorization`;
- o contexto valida o token com a rota `/auth/me`.

## Fluxo de permissões

O frontend também usa o contexto de autenticação para controlar o que cada perfil pode ver ou executar.

- ADMIN: tem acesso à gestão de usuários e à visão geral do sistema
- MINIMERCADO: controla estoque, vendas e comandas
- SECRETARIA: pode criar e acompanhar comandas

Na criação ou edição de um usuário, o administrador pode marcar a opção de troca de senha no primeiro acesso. Quando marcada, a pessoa é direcionada para `/change-password` após o login e só acessa o restante do sistema depois de cadastrar sua senha pessoal.

## Páginas principais

### LoginPage

Tela inicial para autenticação do usuário.

### DashboardPage

Página central com visão geral do sistema e indicadores principais.

### ProductsPage

Permite listar e gerenciar produtos e estoque.

### CommandsPage

Exibe as comandas, permitindo criar novas e acompanhar o estado aberto/fechado.

### CommandDetailsPage

Mostra os itens de uma comanda, permite adicionar produtos e fechar a operação.

### UsersPage

Disponível para administradores, para gerenciar usuários do sistema.

### PublicCommandPage

Tela pública que exibe uma comanda a partir de um código compartilhado.

## Cliente HTTP

O arquivo frontend/src/services/api.ts centraliza a configuração do Axios, incluindo:

- `baseURL` vindo de `VITE_API_URL`;
- envio automático do token JWT;
- tratamento de respostas 401 para encerrar a sessão.

## Tecnologias do frontend

- React 19 para construção da interface
- TypeScript para maior segurança no código
- Vite para desenvolvimento rápido e build otimizado
- React Router DOM para navegação
- Tailwind CSS para estilização
- Axios para comunicação com a API
- React Hot Toast para mensagens visuais
- QRCode para gerar links de compartilhamento de comandas

## Como executar localmente

```bash
cd frontend
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

# Frontend — Mini Mercado EJC

## O que é frontend

Frontend é a parte visual do sistema.

É onde o usuário:

* vê informações
* clica em botões
* envia dados
* interage com o sistema

---

# Tecnologias usadas

* React
* Vite
* JavaScript
* CSS

---

# React

## O que é

React é uma biblioteca para criar interfaces.

Ela trabalha usando componentes.

---

# Componentes

Exemplo:

```jsx
function App() {
  return <h1>Mini Mercado</h1>
}

export default App
```

---

# JSX

## O que aprendi

JSX permite misturar HTML com JavaScript.

Exemplo:

```jsx
<h1>Olá</h1>
```

---

# Vite

## O que é

Ferramenta usada para criar projetos React rapidamente.

Criação:

```bash
npm create vite@latest
```

---

# App.jsx

Arquivo principal do React.

Tudo começa nele.

---

# Estado (useState)

## O que é

Permite armazenar dados no componente.

Exemplo:

```jsx
const [produtos, setProdutos] = useState([])
```

---

# useEffect

## O que faz

Executa código automaticamente.

Muito usado para buscar dados da API.

Exemplo:

```jsx
useEffect(() => {
  buscarProdutos()
}, [])
```

---

# Consumindo API

```js
fetch("http://localhost:3000/products")
```

## O que aprendi

O frontend conversa com o backend através de requisições HTTP.

---

# Métodos HTTP

## GET

Buscar dados.

## POST

Criar dados.

---

# Renderização de lista

```jsx
{produtos.map((produto) => (
  <div key={produto.id}>
    {produto.nome}
  </div>
))}
```

# Componentização
Separação de partes da inteface
Vatagens:
-Organização
-Reutilização
-Escalabilidade

```
type ProductProps
-Validação de tipagem!

```



---

# O que aprendi até agora

* criar interface
* usar React
* usar componentes
* usar JSX
* consumir API
* renderizar listas
* usar estados
* integrar frontend e backend

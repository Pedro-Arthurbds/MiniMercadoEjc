import toast from 'react-hot-toast'
import { api } from '../services/api'

// ── Tipagem das props ────────────────────────────────────────
// "Props" são os dados que o componente pai passa para este componente.
// TypeScript exige que a gente declare o "formato" esperado de cada prop.
type ProductProps = {
  product: {       // objeto com todos os dados do produto
    id: number
    name: string
    category: string
    price: number
    stock: number
  }

  onDeleted: () => void  // função de callback: avisa o pai que algo mudou
                         // (geralmente para recarregar a lista de produtos)
}

// ── Declaração do componente ─────────────────────────────────
// Desestruturamos as props diretamente no parâmetro para facilitar o uso
export function ProductCard({
  product,
  onDeleted,
}: ProductProps) {

  // ── [DELETE] Deletar produto ───────────────────────────────
  // Chama a API para remover o produto pelo ID e avisa o pai para
  // atualizar a lista.
async function handleDeleteProduct() {
  const confirmed = confirm(
    `Deseja deletar ${product.name}?`
  )

  if (!confirmed) return

  await api.delete(
    `/products/${product.id}`
  )

  toast.success('Produto removido')

  onDeleted()
}

  // ── [PUT] Atualizar estoque ────────────────────────────────
  // Recebe o novo valor de estoque e envia todos os campos do produto
  // para a rota de atualização (a API PUT exige o objeto completo).
  async function updateStock(newStock: number) {
    await api.put(
      `/products/${product.id}`,
      {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: newStock,       // apenas o estoque muda de fato
      }
    )

    toast.success('Estoque atualizado')

    onDeleted()  // recarrega a lista após a atualização
  }

  // ── [POST] Registrar venda ─────────────────────────────────
  // Envia uma venda de 1 unidade do produto para a API.
  // O try/catch captura erros (ex: estoque zerado) e exibe um alerta.
  async function handleSale() {
    try {
      await api.post(
        '/sales',
        {
          productId: product.id,
          quantity: 1,          // sempre vende 1 unidade por clique
        }
      )

      onDeleted()  // recarrega a lista para refletir o novo estoque

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // A API retorna erro 400 quando o estoque é insuficiente
      toast.error("Produto sem estoque disponível."); // ⚠️ typo: "insulficiente" → "insuficiente"
    }
  }

  // ── Variável auxiliar ──────────────────────────────────────
  // true quando o estoque chega a 0 — usada para travar botões e
  // mudar o visual do cartão (cinza + badge "ESGOTADO")
  const isOutOfStock = product.stock <= 0

  const isLowStock =
  product.stock > 0 &&
  product.stock <= 5

  // ── Renderização (JSX) ─────────────────────────────────────
  // O que está dentro do return é o HTML do componente.
  // As classes do Tailwind controlam layout, cores e responsividade.
  return (

    // Container principal do cartão
    // Muda de aparência dinamicamente baseado em `isOutOfStock`
    <div
      className={`
        p-6 rounded-3xl border
        flex flex-col gap-5
        transition-all duration-300
        backdrop-blur-sm
        ${
          isOutOfStock
            ? 'bg-gray-100 border-gray-200 opacity-80'
            : `
              bg-white/90
              border-gray-100
              hover:shadow-2xl
              hover:-translate-y-1
            `
  }
`}
    >

      {/* ── Cabeçalho: categoria + nome ── */}
      <div>
        {/* Badge de categoria (ex: "Bebidas", "Laticínios") */}
        <span className="
          inline-block
          text-xs
          font-semibold
          bg-blue-100
          text-blue-700
          px-3
          py-1
          rounded-full
        ">
          {product.category}
        </span>

        <h2 className="text-2xl font-black mt-4 text-gray-800">
          {product.name}
        </h2>
      </div>

      {/* ── Preço, estoque e badge de esgotado ── */}
      <div>
        <p className="text-3xl font-black text-green-600 mt-2">
          R$ {product.price.toFixed(2)}
        </p>

        <div className="mt-3">
      {
        isOutOfStock ? (
          <span className="
            bg-red-100
            text-red-700
            px-3
            py-1
            rounded-full
            text-sm
            font-bold
          ">
            Esgotado
          </span>
        ) : isLowStock ? (
          <span className="
            bg-yellow-100
            text-yellow-700
            px-3
            py-1
            rounded-full
            text-sm
            font-bold
          ">
            Baixo estoque
          </span>
        ) : (
          <span className="
            bg-green-100
            text-green-700
            px-3
            py-1
            rounded-full
            text-sm
            font-bold
          ">
            Em estoque
          </span>
        )
      }

      <p className="mt-2 text-gray-500">
        {product.stock} unidades
      </p>
    </div>
      </div>

      {/* ── Controles de estoque (- e +) ── */}
      {/* Chama updateStock com stock - 1 ou stock + 1 a cada clique */}
      <div className="flex items-center justify-center gap-5 py-2">
        <button
          onClick={() => {
            if (product.stock > 0) {
              updateStock(product.stock - 1)
            }
          }}
          disabled={product.stock <= 0}
          className="
          bg-red-500
          hover:bg-red-600
          transition-all
          text-white
          w-11 h-11
          rounded-xl
          cursor-pointer
          text-xl
          font-bold
        "
        >
          -
        </button>

        {/* Exibe o valor atual do estoque entre os botões */}
        <span
        className="
          text-3xl
          font-black
          min-w-15
          text-center
          bg-gray-100
          rounded-xl
          py-2
        "
        >
          {product.stock}
        </span>

        <button
          onClick={() => updateStock(product.stock + 1)}
          className="
          bg-green-500
          hover:bg-green-600
          transition-all
          text-white
          w-11 h-11
          rounded-xl
          cursor-pointer
          text-xl
          font-bold
        "
        >
          +
        </button>
      </div>

      {/* ── Botão Vender ── */}
      {/* disabled={isOutOfStock} impede o clique quando esgotado */}
      {/* A aparência também muda: azul normal → cinza bloqueado    */}
      <button
        onClick={handleSale}
        disabled={isOutOfStock}
        className={`
          text-white
          py-3
          rounded-xl
          font-bold
          transition-all
          shadow-md
          hover:scale-[1.02]
          active:scale-[0.98]
          ${
            isOutOfStock
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        Vender
      </button>

      {/* ── Botão Deletar ── */}
      {/* Sempre visível e ativo — remove o produto permanentemente */}
      <button
        onClick={handleDeleteProduct}
        className="
          bg-red-600
          hover:bg-red-700
          transition-all
          text-white
          py-3
          rounded-xl
          font-bold
          shadow-md
          hover:scale-[1.02]
          active:scale-[0.98]
        "
      >
        Deletar
      </button>

    </div>
  )
}
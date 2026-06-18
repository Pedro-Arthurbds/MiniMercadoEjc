/* eslint-disable @typescript-eslint/no-unused-vars */
import toast from "react-hot-toast";
import { api } from "../services/api";
import { FaTrashAlt, FaPlus, FaBoxOpen } from "react-icons/fa";
import { useState } from "react";

type ProductProps = {
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
  };
  onDeleted: () => void;
};

export function ProductCard({ product, onDeleted }: ProductProps) {
  // Estado que guarda apenas a quantidade de NOVOS produtos que chegaram
  const [incomingStock, setIncomingStock] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDeleteProduct() {
    const confirmed = confirm(`Deseja deletar ${product.name}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/products/${product.id}`);
      toast.success("Produto removido");
      onDeleted();
    } catch (error) {
      toast.error("Erro ao remover produto.");
    }
  }

  // Função que soma a entrada com o estoque atual
  async function handleAddStock(e: React.FormEvent) {
    e.preventDefault();
    const amountToAdd = parseInt(incomingStock, 10);

    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      toast.error("Insira um valor válido maior que zero.");
      return;
    }

    setIsSubmitting(true);
    const newStock = product.stock + amountToAdd;

    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: newStock,
      });
      toast.success(`${amountToAdd} unidades adicionadas!`);
      setIncomingStock(""); // Limpa o campo após o sucesso
      onDeleted();
    } catch (error) {
      toast.error("Erro ao atualizar estoque.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      className={`relative p-6 rounded-2xl border flex flex-col justify-between gap-5 transition-all duration-300 bg-white shadow-sm hover:shadow-md border-slate-100 ${
        isOutOfStock ? "bg-slate-50/80 opacity-90" : ""
      }`}
    >
      {/* Botão Deletar */}
      <button
        onClick={handleDeleteProduct}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
        title="Deletar produto"
      >
        <FaTrashAlt className="text-sm" />
      </button>

      {/* Cabeçalho */}
      <div>
        <span className="inline-block text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
          {product.category}
        </span>
        <h2 className="text-xl font-bold mt-3 text-slate-800 pr-6 line-clamp-1">
          {product.name}
        </h2>
        <p className="text-2xl font-extrabold text-slate-900 mt-1">
          R$ {product.price.toFixed(2)}
        </p>
      </div>

      {/* Exibição Clara do Estoque Atual */}
      <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
            <FaBoxOpen className="text-slate-400" />
            Estoque Atual
          </span>
          <span className={`text-lg font-black ${
            isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-800"
          }`}>
            {product.stock} un.
          </span>
        </div>
        
        {/* Status em texto auxiliar */}
        <p className="text-xs text-right font-medium">
          {isOutOfStock ? (
            <span className="text-rose-500">Esgotado</span>
          ) : isLowStock ? (
            <span className="text-amber-500">Atenção: Baixo</span>
          ) : (
            <span className="text-emerald-500">Nível Saudável</span>
          )}
        </p>
      </div>

      {/* Formulário de Adição de Nova Remessa */}
      <div className="pt-2">
        <label className="text-xs font-semibold text-slate-500 block mb-2 uppercase tracking-wide">
          Registrar Entrada
        </label>
        
        <form onSubmit={handleAddStock} className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            placeholder="Qtd..."
            value={incomingStock}
            onChange={(e) => setIncomingStock(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!incomingStock || isSubmitting}
            className="flex shrink-0 items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <FaPlus className="text-xs" />
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
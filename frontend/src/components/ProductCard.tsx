/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { FaTrash, FaSave, FaEdit, FaTimes } from "react-icons/fa";
import { ProductForm } from "./ProductForm";

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
  const { hasRole } = useAuth();
  const canManageStock = hasRole("MINIMERCADO");

  const [newStock, setNewStock] = useState(product.stock);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setNewStock(product.stock);
  }, [product.stock]);

  async function handleDeleteProduct() {
    const confirmed = confirm(`Deseja deletar "${product.name}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/products/${product.id}`);
      toast.success("Produto removido");
      onDeleted();
    } catch {
      toast.error("Erro ao remover produto");
    }
  }

  async function handleUpdateStock(e: React.FormEvent) {
    e.preventDefault();

    if (Number.isNaN(newStock) || newStock < 0) {
      toast.error("Quantidade inválida");
      return;
    }

    if (newStock === product.stock) return;

    setSaving(true);
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: newStock,
      });
      toast.success("Estoque atualizado");
      onDeleted();
    } catch {
      toast.error("Erro ao atualizar estoque");
    } finally {
      setSaving(false);
    }
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const statusBadge = isOutOfStock
    ? { label: "Esgotado", className: "bg-rose-100 text-rose-700" }
    : isLowStock
      ? { label: "Baixo estoque", className: "bg-amber-100 text-amber-700" }
      : { label: "Em estoque", className: "bg-emerald-100 text-emerald-700" };

  // ── Modo edição: mostra o formulário inline ──
  if (editing && canManageStock) {
    return (
      <div className="rounded-2xl border border-indigo-200 ring-2 ring-indigo-100 bg-white shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Editar produto</h3>
          <button
            onClick={() => setEditing(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <ProductForm
          product={product}
          onProductCreated={() => {
            setEditing(false);
            onDeleted();
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  // ── Modo normal ──
  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-all ${
        isOutOfStock
          ? "bg-slate-50 border-slate-200 opacity-80"
          : "bg-white border-slate-100 hover:shadow-md"
      }`}
    >
      {/* Categoria + nome + botão editar */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="inline-block text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg">
            {product.category}
          </span>
          <h2 className="text-lg font-bold text-slate-800 mt-3 leading-tight truncate">
            {product.name}
          </h2>
        </div>

        {canManageStock && (
          <button
            onClick={() => setEditing(true)}
            className="flex-shrink-0 mt-0.5 p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition"
            title="Editar produto"
          >
            <FaEdit className="text-sm" />
          </button>
        )}
      </div>

      {/* Preço + status */}
      <div className="flex items-end justify-between">
        <p className="text-2xl font-extrabold text-slate-800 tabular-nums">
          R$ {product.price.toFixed(2)}
        </p>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge.className}`}
        >
          {statusBadge.label}
        </span>
      </div>

      <p className="text-sm text-slate-400 -mt-2">
        {product.stock} {product.stock === 1 ? "unidade" : "unidades"} em
        estoque
      </p>

      {/* Controle de estoque */}
      {canManageStock && (
        <form
          onSubmit={handleUpdateStock}
          className="flex items-center gap-2 pt-3 border-t border-slate-100"
        >
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ajustar estoque
            </label>
            <input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-center font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={saving || newStock === product.stock}
            className="mt-5 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            <FaSave className="text-xs" />
            {saving ? "…" : "Salvar"}
          </button>
        </form>
      )}

      {/* Deletar */}
      {canManageStock && (
        <button
          onClick={handleDeleteProduct}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors"
        >
          <FaTrash className="text-xs" />
          Remover produto
        </button>
      )}
    </div>
  );
}

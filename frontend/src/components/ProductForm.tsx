import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../services/api";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
};

type ProductFormProps = {
  onProductCreated: () => void;
  product?: Product; // se passado, entra em modo edição
  onCancel?: () => void;
};

export function ProductForm({
  onProductCreated,
  product,
  onCancel,
}: ProductFormProps) {
  const isEditing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !category || !price || !stock) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await api.put(`/products/${product.id}`, {
          name,
          category,
          price: Number(price),
          stock: Number(stock),
        });
        toast.success("Produto atualizado!");
      } else {
        await api.post("/products", {
          name,
          category,
          price: Number(price),
          stock: Number(stock),
        });
        toast.success("Produto criado com sucesso!");
        setName("");
        setCategory("");
        setPrice("");
        setStock("");
      }

      onProductCreated();
    } catch (error) {
      toast.error(
        isEditing ? "Erro ao atualizar produto" : "Erro ao criar produto",
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Nome
          </label>
          <input
            type="text"
            placeholder="Nome do produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Categoria
          </label>
          <input
            type="text"
            placeholder="Ex: Bebidas, Laticínios…"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Preço (R$)
          </label>
          <input
            type="number"
            placeholder="0,00"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estoque inicial
          </label>
          <input
            type="number"
            placeholder="0"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {loading
            ? "Salvando…"
            : isEditing
              ? "Salvar alterações"
              : "Cadastrar produto"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

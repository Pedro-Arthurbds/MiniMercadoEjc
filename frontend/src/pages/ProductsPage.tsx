/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { ProductCard } from "../components/ProductCard";
import { ProductForm } from "../components/ProductForm";
import { api } from "../services/api";
import {
  FaSearch,
  FaBox,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTag,
  FaInbox,
} from "react-icons/fa";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
};

function SummaryCard({
  label,
  value,
  accent,
  icon,
  onClick,
  active,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`bg-white rounded-2xl border shadow-sm p-4 sm:p-6 flex items-center gap-3 sm:gap-4 w-full text-left transition-all ${
        active
          ? "border-rose-300 ring-2 ring-rose-200"
          : "border-slate-100"
      } ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-base sm:text-lg flex-shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 tabular-nums leading-tight">
          {value}
        </p>
      </div>
    </Wrapper>
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  async function loadProducts() {
    try {
      const r = await api.get<Product[]>("/products");
      setProducts(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const categories = ["", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "" ? true : p.category === selectedCategory;
    const matchesCritical = showCriticalOnly ? p.stock <= 10 : true;
    return matchesSearch && matchesCategory && matchesCritical;
  });

  const criticalStock = products.filter((p) => p.stock <= 10).length;
  const healthyStock = products.filter((p) => p.stock > 10).length;

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-400">
              Carregando produtos…
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-10">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                Estoque
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-none">
                Produtos
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs sm:text-sm text-slate-400 capitalize hidden sm:block">
                {today}
              </p>
              <button
                onClick={() => setShowForm((prev) => !prev)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
              >
                {showForm ? "✕ Cancelar" : "+ Novo Produto"}
              </button>
            </div>
          </div>

          {/* Summary Cards — 1 col mobile, 3 cols sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
            <SummaryCard
              label="Total de Produtos"
              value={products.length}
              accent="bg-indigo-500"
              icon={<FaBox />}
            />
            <SummaryCard
              label="Estoque Saudável"
              value={healthyStock}
              accent="bg-emerald-500"
              icon={<FaCheckCircle />}
            />
            <SummaryCard
              label="Estoque Crítico"
              value={criticalStock}
              accent={criticalStock > 0 ? "bg-rose-500" : "bg-slate-400"}
              icon={<FaExclamationTriangle />}
              onClick={() => setShowCriticalOnly((prev) => !prev)}
              active={showCriticalOnly}
            />
          </div>

          {/* Product Form (collapsible) */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-5 sm:mb-6">
              <h2 className="text-sm font-bold text-slate-700 mb-4 sm:mb-5">
                Cadastrar Novo Produto
              </h2>
              <ProductForm
                onProductCreated={() => {
                  void loadProducts();
                  setShowForm(false);
                }}
              />
            </div>
          )}

          {/* Filters + Search */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 mb-5 sm:mb-6 flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar produto…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              />
            </div>

            {/* Category pills + critical toggle + count */}
            <div className="flex items-center gap-2 flex-wrap">
              <FaTag className="text-slate-300 text-xs flex-shrink-0 hidden sm:block" />
              <div className="flex gap-2 flex-wrap flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-indigo-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                    }`}
                  >
                    {cat || "Todos"}
                  </button>
                ))}
                <button
                  onClick={() => setShowCriticalOnly((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    showCriticalOnly
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  <FaExclamationTriangle className="text-[10px]" />
                  Crítico
                </button>
              </div>
              <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-auto">
                {filteredProducts.length} produto
                {filteredProducts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Product Grid — 1 col mobile, 2 md, 3 lg */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <FaInbox className="text-5xl text-slate-300" />
              <p className="text-base font-medium text-slate-400 text-center px-4">
                {search
                  ? `Nenhum produto encontrado para "${search}"`
                  : showCriticalOnly
                  ? "Nenhum produto com estoque crítico"
                  : "Nenhum produto nesta categoria"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-indigo-500 hover:underline"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onDeleted={loadProducts} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Navbar } from "../components/Navbar";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaSearch,
} from "react-icons/fa";
import QRCode from "qrcode";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

type CommandItem = {
  id: number;
  quantity: number;
  product: Product;
};

type Command = {
  id: number;
  customer: string;
  total: number;
  closed: boolean;
  items: CommandItem[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: CommandItem }) {
  const subtotal = item.product.price * item.quantity;
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {item.product.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.quantity}× · {formatCurrency(item.product.price)} cada
        </p>
      </div>
      <span className="text-sm font-bold text-slate-700 flex-shrink-0 tabular-nums">
        {formatCurrency(subtotal)}
      </span>
    </div>
  );
}

// ─── Quantity Selector ────────────────────────────────────────────────────────

function QuantitySelector({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-600 active:scale-95"
      >
        <FaMinus className="text-xs" />
      </button>
      <span className="w-8 text-center text-base font-bold text-slate-800 tabular-nums select-none">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition text-slate-600 active:scale-95"
      >
        <FaPlus className="text-xs" />
      </button>
    </div>
  );
}

// ─── QR Panel ─────────────────────────────────────────────────────────────────

function QRPanel({ command }: { command: Command }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commandUrl = `${window.location.origin}/commands/${command.id}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, commandUrl, {
      width: 160,
      margin: 2,
      color: { dark: "#111827", light: "#ffffff" },
    });
  }, [commandUrl]);

  function handlePrint() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>QR Comanda #${command.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              gap: 12px;
              padding: 24px;
            }
            img { width: 200px; height: 200px; }
            h1 { font-size: 18px; font-weight: 700; }
            p { font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>${command.customer}</h1>
          <p>Comanda #${command.id}</p>
          <img src="${dataUrl}" />
          <p>${commandUrl}</p>
          <script>window.onload = () => { window.print(); window.close() }</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row lg:flex-col items-center gap-4">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-start w-full">
        QR Code
      </h2>

      <div className="bg-slate-50 rounded-xl p-3 flex-shrink-0">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex flex-col gap-3 flex-1 w-full sm:w-auto lg:w-full">
        <p className="text-xs text-slate-400 text-center break-all">
          {commandUrl}
        </p>
        <button
          onClick={handlePrint}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:bg-black text-white text-sm font-semibold transition-colors"
        >
          🖨️ Imprimir QR
        </button>
      </div>
    </div>
  );
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────

function AddItemModal({
  product,
  onClose,
  onConfirm,
  adding,
  error,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (qty: number) => void;
  adding: boolean;
  error: string;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sheet on mobile, centered modal on sm+ */}
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-xl p-6 pb-8 sm:pb-6">
        {/* Drag handle (mobile only) */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              {formatCurrency(product.price)} · {product.stock} em estoque
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm text-slate-500">Quantidade</span>
          <QuantitySelector
            value={quantity}
            max={product.stock}
            onChange={setQuantity}
          />
        </div>

        <div className="flex items-center justify-between text-sm mb-5">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-bold text-slate-800 tabular-nums">
            {formatCurrency(product.price * quantity)}
          </span>
        </div>

        {error && (
          <p className="text-xs text-rose-500 mb-3 flex items-center gap-1">
            ⚠ {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(quantity)}
            disabled={adding}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {adding ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adicionando…
              </>
            ) : (
              <>
                <FaPlus className="text-xs" /> Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CommandDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [command, setCommand] = useState<Command | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);

  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [search, setSearch] = useState("");

  // Mobile tab state: 'items' | 'catalog'
  const [mobileTab, setMobileTab] = useState<"items" | "catalog">("items");

  async function loadCommand() {
    const response = await api.get(`/commands/${id}`);
    setCommand(response.data);
  }

  async function loadProducts() {
    const response = await api.get("/products");
    setProducts(response.data);
  }

  useEffect(() => {
    Promise.all([loadCommand(), loadProducts()]).finally(() =>
      setLoadingPage(false),
    );
  }, []);

  function openModal(product: Product) {
    setModalProduct(product);
    setAddError("");
  }

  function closeModal() {
    setModalProduct(null);
    setAddError("");
  }

  async function handleAddItem(quantity: number) {
    if (!modalProduct) return;
    try {
      setAdding(true);
      setAddError("");
      await api.post("/command-items", {
        commandId: Number(id),
        productId: modalProduct.id,
        quantity,
      });
      await Promise.all([loadCommand(), loadProducts()]);
      closeModal();
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.error ?? "Erro ao adicionar item.";
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const alreadyInCommand = (productId: number) =>
    command?.items.some((i) => i.product.id === productId) ?? false;

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loadingPage || !command) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium">Carregando comanda…</p>
          </div>
        </div>
      </>
    );
  }

  // ── Shared: product catalog panel content ─────────────────────────────────

  const CatalogContent = (
    <>
      {command.closed ? (
        <div className="flex-1 flex items-center justify-center py-12 text-slate-400 text-sm text-center px-4">
          Comanda fechada — não é possível adicionar itens.
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar produto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
            />
          </div>

          {/* Product list */}
          <div
            className="overflow-y-auto space-y-2 flex-1 pr-0.5"
            style={{ maxHeight: "clamp(260px, 50vh, 520px)" }}
          >
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">Nenhum produto encontrado.</p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs text-indigo-500 hover:underline mt-1"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const inCommand = alreadyInCommand(product.id);
                const outOfStock = product.stock === 0;

                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                      outOfStock
                        ? "border-slate-100 bg-slate-50 opacity-50"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatCurrency(product.price)} · {product.stock} em
                        estoque
                      </p>
                    </div>

                    <button
                      onClick={() => openModal(product)}
                      disabled={outOfStock}
                      className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition active:scale-95 ${
                        outOfStock
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : inCommand
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-indigo-500 text-white hover:bg-indigo-600"
                      }`}
                    >
                      <FaPlus className="text-[10px]" />
                      {outOfStock
                        ? "Sem estoque"
                        : inCommand
                          ? "Adicionar +"
                          : "Adicionar"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </>
  );

  // ── Shared: items panel content ────────────────────────────────────────────

  const ItemsContent = (
    <>
      {command.items.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-slate-300 gap-2">
          <FaShoppingCart className="text-3xl" />
          <p className="text-sm text-slate-400">Nenhum item ainda</p>
        </div>
      ) : (
        <div>
          {command.items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
          <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-100">
            <span className="text-sm font-semibold text-slate-500">Total</span>
            <span className="text-xl font-extrabold text-slate-900 tabular-nums">
              {formatCurrency(command.total)}
            </span>
          </div>
        </div>
      )}
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />

      {/* Modal */}
      {modalProduct && (
        <AddItemModal
          product={modalProduct}
          onClose={closeModal}
          onConfirm={handleAddItem}
          adding={adding}
          error={addError}
        />
      )}

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 mb-6 transition"
          >
            <FaArrowLeft className="text-xs" /> Voltar
          </button>

          {/* Command header card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                  Detalhe
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                  Comanda #{command.id}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {command.customer}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${
                    command.closed
                      ? "bg-slate-100 text-slate-500"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {command.closed ? "Fechada" : "Aberta"}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                  {formatCurrency(command.total)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Mobile Tab Nav (visible on < lg) ── */}
          <div className="flex lg:hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-1 mb-5 gap-1">
            {[
              { key: "items", label: `Itens (${command.items.length})` },
              { key: "catalog", label: "Adicionar" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMobileTab(tab.key as "items" | "catalog")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                  mobileTab === tab.key
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Mobile: single panel ── */}
          <div className="lg:hidden space-y-5">
            {mobileTab === "items" ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Itens pedidos
                </h2>
                {ItemsContent}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Adicionar produto
                </h2>
                {CatalogContent}
              </div>
            )}

            {/* QR always visible on mobile below tabs */}
            <QRPanel command={command} />
          </div>

          {/* ── Desktop: 3-column grid (visible on lg+) ── */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-5">
            {/* Left column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Itens pedidos
                </h2>
                {ItemsContent}
              </div>

              <QRPanel command={command} />
            </div>

            {/* Right column: catalog */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Adicionar produto
              </h2>
              {CatalogContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

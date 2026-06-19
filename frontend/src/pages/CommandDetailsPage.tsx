/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaSearch,
  FaPrint,
  FaQrcode,
  FaReceipt,
  FaCheckCircle,
  FaClock,
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
  paid: boolean;
  product: Product;
  addedBy?: { id: number; name: string } | null;
};

type Command = {
  id: number;
  customer: string;
  total: number;
  closed: boolean;
  items: CommandItem[];
  publicCode: string;
  openedBy?: { id: number; name: string } | null;
  closedBy?: { id: number; name: string } | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  canManage,
  onTogglePaid,
}: {
  item: CommandItem;
  canManage: boolean;
  onTogglePaid: (item: CommandItem) => void;
}) {
  const subtotal = item.product.price * item.quantity;
  return (
    <div
      className={`flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 px-2 -mx-2 rounded-lg transition-colors ${
        item.paid ? "opacity-60" : "hover:bg-slate-50/50"
      }`}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-bold text-slate-800 truncate ${item.paid ? "line-through text-slate-400" : ""}`}
          >
            {item.product.name}
          </p>
          {item.paid ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap">
              <FaCheckCircle className="text-[8px]" /> Pago
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100 whitespace-nowrap">
              <FaClock className="text-[8px]" /> Em aberto
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
            {item.quantity}x
          </span>
          <span>·</span>
          <span>{formatCurrency(item.product.price)}</span>
          {item.addedBy && (
            <>
              <span>·</span>
              <span className="text-indigo-500 font-semibold">
                👤 {item.addedBy.name}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-extrabold text-slate-700 tabular-nums">
          {formatCurrency(subtotal)}
        </span>

        {canManage && (
          <button
            onClick={() => onTogglePaid(item)}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 border ${
              item.paid
                ? "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                : "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {item.paid ? "Desfazer" : "Pago ✓"}
          </button>
        )}
      </div>
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
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center transition text-slate-600 hover:bg-slate-50 active:scale-95"
      >
        <FaMinus className="text-[10px]" />
      </button>
      <span className="w-10 text-center text-sm font-extrabold text-slate-800 tabular-nums select-none">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition text-slate-600 hover:bg-slate-50 active:scale-95"
      >
        <FaPlus className="text-[10px]" />
      </button>
    </div>
  );
}

// ─── QR Panel ─────────────────────────────────────────────────────────────────

function QRPanel({ command }: { command: Command }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commandUrl = `${window.location.origin}/c/${command.publicCode}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, commandUrl, {
      width: 140,
      margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col items-center gap-4">
      <div className="w-full flex items-center gap-2 pb-3 border-b border-slate-100">
        <FaQrcode className="text-slate-400 text-sm" />
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Acesso via QR Code
        </h2>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-center border border-slate-100 shadow-inner">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <div className="w-full space-y-3">
        <p className="text-[11px] text-slate-400 text-center break-all bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
          {commandUrl}
        </p>
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:bg-black text-white text-sm font-bold transition-all shadow-sm"
        >
          <FaPrint className="text-xs" /> Imprimir Ficha
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-xl p-6 pb-8 sm:pb-6 border border-slate-100">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">
              {product.name}
            </h3>
            <p className="text-xs font-semibold text-indigo-500 mt-1">
              {formatCurrency(product.price)} · {product.stock} disponíveis
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 mb-4 border border-slate-100">
          <span className="text-sm font-medium text-slate-600">Quantidade</span>
          <QuantitySelector
            value={quantity}
            max={product.stock}
            onChange={setQuantity}
          />
        </div>

        <div className="flex items-center justify-between text-sm mb-5 px-1">
          <span className="font-medium text-slate-400">Total do item</span>
          <span className="font-black text-lg text-slate-800 tabular-nums">
            {formatCurrency(product.price * quantity)}
          </span>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-500 mb-4 bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-center gap-2">
            ⚠ {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(quantity)}
            disabled={adding}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {adding ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando…
              </>
            ) : (
              "Confirmar"
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

  const [mobileTab, setMobileTab] = useState<"items" | "catalog">("items");

  const { hasRole } = useAuth();
  const canManageItems = hasRole("MINIMERCADO");

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

  async function handleTogglePaid(item: CommandItem) {
    try {
      await api.patch(`/command-items/${item.id}/paid`, {
        paid: !item.paid,
      });
      await loadCommand();
    } catch {
      // erro silencioso — a lista vai recarregar no próximo loadCommand
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const alreadyInCommand = (productId: number) =>
    command?.items.some((i) => i.product.id === productId) ?? false;

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

  // Totais separados
  const totalPaid = command.items
    .filter((i) => i.paid)
    .reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const totalPending = command.items
    .filter((i) => !i.paid)
    .reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  const mobileTabs = [
    { key: "items" as const, label: `Itens (${command.items.length})` },
    ...(canManageItems
      ? [{ key: "catalog" as const, label: "Adicionar Itens" }]
      : []),
  ];

  // ── Items panel ────────────────────────────────────────────────────────────

  const ItemsContent = (
    <>
      {command.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
            <FaShoppingCart className="text-base" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            Nenhum item lançado ainda
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="divide-y divide-slate-100 flex-1">
            {command.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                canManage={canManageItems}
                onTogglePaid={handleTogglePaid}
              />
            ))}
          </div>

          {/* Totais */}
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            {totalPaid > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <FaCheckCircle className="text-xs" /> Pago
                </span>
                <span className="font-bold text-emerald-600 tabular-nums">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
            )}
            {totalPending > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                  <FaClock className="text-xs" /> Em aberto
                </span>
                <span className="font-bold text-amber-600 tabular-nums">
                  {formatCurrency(totalPending)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <FaReceipt className="text-xs" /> Total
              </span>
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {formatCurrency(command.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── Catalog panel ──────────────────────────────────────────────────────────

  const CatalogContent = (
    <>
      {command.closed ? (
        <div className="flex-1 flex items-center justify-center py-12 text-slate-400 text-sm text-center px-4 font-medium">
          Comanda fechada — não é possível adicionar itens.
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar produto pelo nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
            />
          </div>

          <div
            className="overflow-y-auto space-y-2 flex-1 pr-1"
            style={{ maxHeight: "clamp(280px, 55vh, 520px)" }}
          >
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-2xl mb-2">🔎</p>
                <p className="text-sm font-medium">
                  Nenhum produto encontrado.
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs text-indigo-500 font-bold hover:underline mt-2 block mx-auto"
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
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      outOfStock
                        ? "border-slate-100 bg-slate-50/60 opacity-50"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        <span className="text-emerald-600">
                          {formatCurrency(product.price)}
                        </span>
                        {" · "}
                        <span
                          className={product.stock <= 5 ? "text-amber-500" : ""}
                        >
                          {product.stock} un.
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => openModal(product)}
                      disabled={outOfStock}
                      className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 ${
                        outOfStock
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : inCommand
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      <FaPlus className="text-[9px]" />
                      {outOfStock
                        ? "Sem estoque"
                        : inCommand
                          ? "Por mais"
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />

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
          <button
            onClick={() => navigate("/commands")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 mb-6 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm transition-all"
          >
            <FaArrowLeft className="text-[10px]" /> Voltar para Comandas
          </button>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                    Mesa / Cliente
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      command.closed
                        ? "bg-slate-100 text-slate-500"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${command.closed ? "bg-slate-400" : "bg-emerald-500 animate-pulse"}`}
                    />
                    {command.closed ? "Fechada" : "Ativa"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {command.customer}
                </h1>

                <div className="text-xs font-medium text-slate-400 mt-2 space-y-0.5">
                  <p>
                    🔹 ID:{" "}
                    <span className="font-semibold text-slate-600">
                      #{command.id}
                    </span>
                  </p>
                  {command.openedBy && (
                    <p>
                      📩 Abertura: por{" "}
                      <span className="font-semibold text-slate-500">
                        {command.openedBy.name}
                      </span>
                    </p>
                  )}
                  {command.closed && command.closedBy && (
                    <p>
                      🔒 Fechamento: por{" "}
                      <span className="font-semibold text-slate-500">
                        {command.closedBy.name}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center items-start md:items-end min-w-[180px] gap-1">
                {totalPaid > 0 && (
                  <div className="flex items-center gap-2 w-full md:justify-end">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Pago
                    </span>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                )}
                {totalPending > 0 && (
                  <div className="flex items-center gap-2 w-full md:justify-end">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                      Em aberto
                    </span>
                    <span className="text-sm font-bold text-amber-600 tabular-nums">
                      {formatCurrency(totalPending)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 w-full md:justify-end pt-1 border-t border-slate-200 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {formatCurrency(command.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex lg:hidden bg-white p-1 rounded-xl border border-slate-100 shadow-sm mb-5 gap-1">
            {mobileTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMobileTab(tab.key)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mobileTab === tab.key
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-5">
            {mobileTab === "items" ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Itens Consumidos
                </h2>
                {ItemsContent}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Lançar Itens
                </h2>
                {CatalogContent}
              </div>
            )}
            <QRPanel command={command} />
          </div>

          {/* Desktop Layout */}
          <div
            className={`hidden lg:grid gap-6 ${canManageItems ? "lg:grid-cols-3" : "lg:grid-cols-1 max-w-xl mx-auto"}`}
          >
            <div
              className={
                canManageItems ? "lg:col-span-1 space-y-6" : "space-y-6"
              }
            >
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Itens Consumidos
                </h2>
                {ItemsContent}
              </div>
              <QRPanel command={command} />
            </div>

            {canManageItems && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-fit">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Lançar Novos Produtos
                </h2>
                {CatalogContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
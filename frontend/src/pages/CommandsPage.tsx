/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { CommandCard } from "../components/CommandCard";
import { CreateCommandModal } from "../components/CreateCommandModal";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaSearch,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaInbox,
  FaPlus,
} from "react-icons/fa";

type Command = {
  id: number;
  customer: string;
  total: number;
  closed: boolean;
  createdAt?: string;
  openedBy?: { id: number; name: string } | null;
  closedBy?: { id: number; name: string } | null;
};

type Filter = "all" | "open" | "closed";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-slate-800 tabular-nums leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  activeClass,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? `${activeClass} text-white shadow-sm`
          : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const { hasRole } = useAuth();

  async function loadCommands() {
    try {
      const response = await api.get("/commands");
      setCommands(response.data);
    } catch (error) {
      console.error("Erro ao carregar comandas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCommands();
  }, []);

  const openCommands = commands.filter((c) => !c.closed);
  const closedCommands = commands.filter((c) => c.closed);

  const filteredCommands = commands.filter((command) => {
    const matchesSearch = command.customer
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "open"
          ? !command.closed
          : command.closed;

    return matchesSearch && matchesFilter;
  });

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium">Carregando comandas…</p>
          </div>
        </div>
      </>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      {/* Modal de criação */}
      <CreateCommandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadCommands}
      />

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                Gestão
              </p>
              <h1 className="text-4xl font-extrabold text-slate-800 leading-none">
                Comandas
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-400 capitalize hidden sm:block">
                {today}
              </p>

              {/* Botão nova comanda */}
              {hasRole("MINIMERCADO", "SECRETARIA") && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <FaPlus className="text-xs" />
                  Nova comanda
                </button>
              )}

              {hasRole("MINIMERCADO", "SECRETARIA") && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-indigo-500 hover:underline mt-1"
                >
                  <FaPlus className="text-xs" /> Criar primeira comanda
                </button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <SummaryCard
              label="Abertas"
              value={openCommands.length}
              accent="bg-emerald-500"
              icon={<FaClock />}
            />
            <SummaryCard
              label="Fechadas"
              value={closedCommands.length}
              accent="bg-indigo-500"
              icon={<FaCheckCircle />}
            />
            <SummaryCard
              label="Total"
              value={commands.length}
              accent="bg-slate-600"
              icon={<FaClipboardList />}
            />
          </div>

          {/* Filters + Search */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex gap-2 shrink-0">
              <FilterButton
                label="Todas"
                active={filter === "all"}
                activeClass="bg-slate-700"
                onClick={() => setFilter("all")}
              />
              <FilterButton
                label="Abertas"
                active={filter === "open"}
                activeClass="bg-emerald-500"
                onClick={() => setFilter("open")}
              />
              <FilterButton
                label="Fechadas"
                active={filter === "closed"}
                activeClass="bg-indigo-500"
                onClick={() => setFilter("closed")}
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-100 mx-1" />

            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por cliente…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              />
            </div>

            <span className="shrink-0 text-xs font-medium text-slate-400 self-center">
              {filteredCommands.length} resultado
              {filteredCommands.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Command List */}
          {filteredCommands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-3">
              <FaInbox className="text-5xl" />
              <p className="text-base font-medium text-slate-400">
                {search
                  ? `Nenhuma comanda encontrada para "${search}"`
                  : "Nenhuma comanda nesta categoria"}
              </p>
              {search ? (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-indigo-500 hover:underline mt-1"
                >
                  Limpar busca
                </button>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-indigo-500 hover:underline mt-1"
                >
                  <FaPlus className="text-xs" /> Criar primeira comanda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCommands.map((command) => (
                <CommandCard
                  key={command.id}
                  command={command}
                  onUpdated={loadCommands}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

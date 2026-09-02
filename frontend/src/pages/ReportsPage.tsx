/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { api } from "../services/api";
import {
  FaFileDownload,
  FaFilter,
  FaHistory,
  FaPlus,
  FaTrash,
  FaLock,
  FaPen,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
} from "react-icons/fa";

type Role = "ADMIN" | "MINIMERCADO" | "SECRETARIA";

type UserOption = {
  id: number;
  name: string;
  role: Role;
};

type AuditAction =
  | "COMMAND_OPENED"
  | "COMMAND_RENAMED"
  | "COMMAND_CLOSED"
  | "ITEM_ADDED"
  | "ITEM_REMOVED"
  | "ITEM_PAID_TOGGLED";

type AuditLog = {
  id: number;
  action: AuditAction | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>;
  createdAt: string;
  user: { id: number; name: string; role: Role } | null;
  command: { id: number; customer: string } | null;
};

const ACTION_META: Record<
  string,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  COMMAND_OPENED: {
    label: "Comanda aberta",
    badge: "bg-blue-100 text-blue-700",
    icon: <FaPlus className="text-[10px]" />,
  },
  COMMAND_RENAMED: {
    label: "Comanda renomeada",
    badge: "bg-amber-100 text-amber-700",
    icon: <FaPen className="text-[10px]" />,
  },
  COMMAND_CLOSED: {
    label: "Comanda fechada",
    badge: "bg-purple-100 text-purple-700",
    icon: <FaLock className="text-[10px]" />,
  },
  ITEM_ADDED: {
    label: "Item adicionado",
    badge: "bg-emerald-100 text-emerald-700",
    icon: <FaPlus className="text-[10px]" />,
  },
  ITEM_REMOVED: {
    label: "Item removido",
    badge: "bg-rose-100 text-rose-700",
    icon: <FaTrash className="text-[10px]" />,
  },
  ITEM_PAID_TOGGLED: {
    label: "Pagamento alterado",
    badge: "bg-sky-100 text-sky-700",
    icon: <FaCheckCircle className="text-[10px]" />,
  },
  PASSWORD_RESET_REQUESTED: {
    label: "Pediu redefinição de senha",
    badge: "bg-orange-100 text-orange-700",
    icon: <FaHistory className="text-[10px]" />,
  },
  PASSWORD_RESET_RESOLVED: {
    label: "Redefinição resolvida",
    badge: "bg-teal-100 text-teal-700",
    icon: <FaCheckCircle className="text-[10px]" />,
  },
};

function actionMeta(action: string) {
  return (
    ACTION_META[action] ?? {
      label: action,
      badge: "bg-slate-100 text-slate-600",
      icon: <FaHistory className="text-[10px]" />,
    }
  );
}

function formatMoney(v: number | undefined) {
  if (typeof v !== "number") return "";
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function describeDetails(log: AuditLog): string {
  const d = log.details || {};
  switch (log.action) {
    case "COMMAND_OPENED":
      return `Comanda aberta para "${d.customer ?? log.command?.customer ?? ""}"`;
    case "COMMAND_RENAMED":
      return `Renomeada de "${d.from ?? ""}" para "${d.to ?? ""}"`;
    case "COMMAND_CLOSED":
      return `Encerrada com total de ${formatMoney(d.total)}`;
    case "ITEM_ADDED":
      return `${d.quantity ?? "?"}× ${d.product ?? ""} · ${formatMoney(d.subtotal)}`;
    case "ITEM_REMOVED":
      return `${d.quantity ?? "?"}× ${d.product ?? ""} removido · estoque devolvido · ${formatMoney(d.subtotal)}`;
    case "ITEM_PAID_TOGGLED":
      return `${d.product ?? ""} marcado como ${d.paid ? "pago" : "não pago"}`;
    case "PASSWORD_RESET_REQUESTED":
      return `Pedido de redefinição para "${d.email ?? ""}"`;
    case "PASSWORD_RESET_RESOLVED":
      return `Redefinição de "${d.email ?? ""}" marcada como resolvida`;
    default:
      return JSON.stringify(d);
  }
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvEscape(value: string) {
  const v = value.replace(/"/g, '""');
  return `"${v}"`;
}

export function ReportsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [personId, setPersonId] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  async function loadUsers() {
    try {
      const r = await api.get<UserOption[]>("/users");
      setUsers(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadLogs() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (personId) params.userId = personId;
      if (action) params.action = action;
      if (from) params.from = from;
      if (to) params.to = to;

      const r = await api.get<AuditLog[]>("/audit-logs", { params });

      if (!Array.isArray(r.data)) {
        console.error(
          "Resposta inesperada de /audit-logs (esperava um array):",
          r.data,
        );
        setLogs([]);
        toast.error(
          "O servidor não retornou o formato esperado. Verifique se a rota /audit-logs e a migration foram aplicadas no backend.",
        );
        return;
      }

      setLogs(r.data);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    void loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId, action, from, to]);

  function clearFilters() {
    setPersonId("");
    setAction("");
    setFrom("");
    setTo("");
  }

  const hasActiveFilters = !!(personId || action || from || to);

  const summary = useMemo(() => {
    const byAction: Record<string, number> = {};
    logs.forEach((l) => {
      byAction[l.action] = (byAction[l.action] || 0) + 1;
    });
    return byAction;
  }, [logs]);

  function handleExportCsv() {
    if (logs.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    const header = ["Data/Hora", "Ação", "Comanda", "Detalhes", "Responsável"];
    const rows = logs.map((log) => [
      formatDateTime(log.createdAt),
      actionMeta(log.action).label,
      log.command?.customer ?? "",
      describeDetails(log),
      log.user?.name ?? "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    link.download = `relatorio-alteracoes-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado");
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                Auditoria
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-none">
                Relatórios
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Histórico completo de alterações no sistema
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 shrink-0"
            >
              <FaFileDownload />
              Exportar CSV
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-slate-400 text-xs" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Filtros
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600"
                >
                  <FaRedo className="text-[10px]" />
                  Limpar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Pessoa
                </label>
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Todas as pessoas</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Tipo de ação
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Todas as ações</option>
                  {Object.entries(ACTION_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  De
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Até
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          {/* Resumo rápido */}
          {!loading && logs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800 text-white">
                {logs.length} registro{logs.length !== 1 ? "s" : ""}
              </span>
              {Object.entries(summary).map(([key, count]) => {
                const meta = actionMeta(key);
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${meta.badge}`}
                  >
                    {meta.icon}
                    {meta.label}: {count}
                  </span>
                );
              })}
            </div>
          )}

          {/* Tabela */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Carregando…</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-2">
                <FaTimesCircle className="text-3xl text-slate-200" />
                <p className="text-sm text-slate-400">
                  Nenhuma alteração encontrada para os filtros selecionados
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left font-semibold text-slate-500 px-4 py-3 whitespace-nowrap">
                        Data/Hora
                      </th>
                      <th className="text-left font-semibold text-slate-500 px-4 py-3 whitespace-nowrap">
                        Ação
                      </th>
                      <th className="text-left font-semibold text-slate-500 px-4 py-3 whitespace-nowrap">
                        Comanda
                      </th>
                      <th className="text-left font-semibold text-slate-500 px-4 py-3">
                        Detalhes
                      </th>
                      <th className="text-left font-semibold text-slate-500 px-4 py-3 whitespace-nowrap">
                        Responsável
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const meta = actionMeta(log.action);
                      return (
                        <tr
                          key={log.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                        >
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap tabular-nums">
                            {formatDateTime(log.createdAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}
                            >
                              {meta.icon}
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                            {log.command?.customer ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {describeDetails(log)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                            {log.user?.name ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 
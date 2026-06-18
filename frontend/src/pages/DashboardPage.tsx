/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { api } from "../services/api";

import {
  FaDollarSign,
  FaMoneyBillWave,
  FaUsers,
  FaClipboardList,
  FaBox,
  FaCheckCircle,
  FaChartLine,
  FaCircle,
  FaPlus,
  FaLock,
} from "react-icons/fa";

type Product = { id: number; name: string; stock: number };
type CommandItem = {
  id: number;
  quantity: number;
  createdAt: string;
  product: { id: number; name: string };
  addedBy?: { id: number; name: string } | null;
};
type Command = {
  id: number;
  customer: string;
  total: number;
  closed: boolean;
  createdAt: string;
  closedAt?: string | null;
  items: CommandItem[];
  openedBy?: { id: number; name: string } | null;
  closedBy?: { id: number; name: string } | null;
};
type Sale = {
  id: number;
  product: string;
  quantity: number;
  total: number;
  createdAt: string;
};

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
  badge,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent: string;
  badge?: { label: string; positive?: boolean };
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white text-sm sm:text-base ${accent}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 tabular-nums leading-none">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      {badge && (
        <div className="mt-auto">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
          >
            <FaCircle className="text-[6px]" />
            {badge.label}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6">
      <h2 className="text-sm font-bold text-slate-700 mb-4 sm:mb-5">{title}</h2>
      {children}
    </div>
  );
}

function StockBar({ stock }: { stock: number }) {
  const pct = Math.min((stock / 10) * 100, 100);
  const color =
    stock === 0
      ? "bg-red-500"
      : stock <= 3
        ? "bg-rose-400"
        : stock <= 7
          ? "bg-amber-400"
          : "bg-emerald-400";
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div
        className={`${color} h-1.5 rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [pr, cr, sr] = await Promise.all([
        api.get<Product[]>("/products"),
        api.get<Command[]>("/commands"),
        api.get<Sale[]>("/sales"),
      ]);
      setProducts(pr.data);
      setCommands(cr.data);
      setSales(sr.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const closedCommands = commands.filter((c) => c.closed);
  const openCommands = commands.filter((c) => !c.closed);
  const totalRevenue = commands.reduce((a, c) => a + c.total, 0);
  const totalArrecadado = closedCommands.reduce((a, c) => a + c.total, 0);
  const totalEmAberto = openCommands.reduce((a, c) => a + c.total, 0);
  const percentualFechadas =
    commands.length > 0 ? (closedCommands.length / commands.length) * 100 : 0;
  const ticketMedio = commands.length > 0 ? totalRevenue / commands.length : 0;

  const criticalStock = products
    .filter((p) => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const ranking: Record<string, number> = {};
  commands.forEach((c) =>
    c.items.forEach((i) => {
      ranking[i.product.name] = (ranking[i.product.name] || 0) + i.quantity;
    }),
  );
  const mostRequestedProducts = Object.entries(ranking)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxQty = mostRequestedProducts[0]?.[1] ?? 1;

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
            <p className="text-sm font-medium text-slate-400">Carregando…</p>
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-6 sm:mb-10">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                Visão Geral
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-none">
                Dashboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 capitalize">
              {today}
            </p>
          </div>

          {/* KPI Grid — 2 cols on mobile, 3 on xl */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
            <StatCard
              title="Participantes"
              value={commands.length}
              subtitle={`${openCommands.length} em aberto`}
              icon={<FaUsers />}
              accent="bg-indigo-500"
              badge={{ label: "Clientes ativos", positive: true }}
            />
            <StatCard
              title="Arrecadado"
              value={`R$ ${totalArrecadado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              subtitle={`${closedCommands.length} fechada${closedCommands.length !== 1 ? "s" : ""}`}
              icon={<FaMoneyBillWave />}
              accent="bg-emerald-500"
              badge={{ label: "Confirmado", positive: true }}
            />
            <StatCard
              title="Em Aberto"
              value={`R$ ${totalEmAberto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              subtitle="Aguardando fechamento"
              icon={<FaDollarSign />}
              accent="bg-amber-500"
              badge={{ label: "Pendente", positive: false }}
            />
            <StatCard
              title="Ticket Médio"
              value={`R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              subtitle="Por comanda"
              icon={<FaClipboardList />}
              accent="bg-sky-500"
            />
            <StatCard
              title="Produtos"
              value={products.length}
              subtitle={`${criticalStock.length} crítico${criticalStock.length !== 1 ? "s" : ""}`}
              icon={<FaBox />}
              accent="bg-violet-500"
              badge={
                criticalStock.length > 0
                  ? {
                      label: `${criticalStock.length} crítico${criticalStock.length > 1 ? "s" : ""}`,
                      positive: false,
                    }
                  : undefined
              }
            />
            <StatCard
              title="Fechamento"
              value={`${percentualFechadas.toFixed(0)}%`}
              subtitle={`${closedCommands.length} de ${commands.length}`}
              icon={<FaChartLine />}
              accent="bg-pink-500"
              badge={{
                label:
                  percentualFechadas >= 50 ? "Acima de 50%" : "Abaixo de 50%",
                positive: percentualFechadas >= 50,
              }}
            />
          </div>

          {/* Analysis — stacked on mobile, 3 cols on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <SectionCard title="⚠️ Estoque Crítico">
              {criticalStock.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <FaCheckCircle className="text-3xl text-emerald-300" />
                  <p className="text-sm text-slate-400">
                    Nenhum produto crítico
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {criticalStock.map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[70%]">
                          {p.name}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${p.stock === 0 ? "bg-red-100 text-red-600" : p.stock <= 3 ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-600"}`}
                        >
                          {p.stock === 0 ? "Esgotado" : `${p.stock} un.`}
                        </span>
                      </div>
                      <StockBar stock={p.stock} />
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="🏆 Mais Pedidos">
              {mostRequestedProducts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Nenhum pedido registrado
                </p>
              ) : (
                <div className="space-y-4">
                  {mostRequestedProducts.map(([name, qty], i) => (
                    <div key={name}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${i === 0 ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"}`}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700 truncate flex-1">
                          {name}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 tabular-nums flex-shrink-0">
                          {qty}×
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${i === 0 ? "bg-indigo-500" : "bg-indigo-200"}`}
                          style={{ width: `${(qty / maxQty) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="🕐 Atividade Recente">
              {(() => {
                // Criar lista unificada de todos os eventos ordenados por data
                const allEvents: Array<{
                  type: "opened" | "closed" | "sale" | "item";
                  date: string;
                  customer?: string;
                  product?: string;
                  quantity?: number;
                  total?: number;
                  byName?: string | null;
                }> = [];

                // Adicionar eventos de abertura de comanda
                commands.forEach((cmd) => {
                  allEvents.push({
                    type: "opened",
                    date: cmd.createdAt,
                    customer: cmd.customer,
                    byName: cmd.openedBy?.name,
                  });
                  if (cmd.closed && cmd.closedAt) {
                    allEvents.push({
                      type: "closed",
                      date: cmd.closedAt,
                      customer: cmd.customer,
                      byName: cmd.closedBy?.name,
                    });
                  }
                });

                // Adicionar vendas avulsas
                sales.forEach((sale) => {
                  allEvents.push({
                    type: "sale",
                    date: sale.createdAt,
                    product: sale.product,
                    quantity: sale.quantity,
                    total: sale.total,
                  });
                });

                // Adicionar itens de comanda
                commands.forEach((cmd) => {
                  cmd.items.forEach((item) => {
                    allEvents.push({
                      type: "item",
                      date: item.createdAt, // ← agora usa a data do item, não da comanda
                      customer: cmd.customer,
                      product: item.product.name,
                      quantity: item.quantity,
                      byName: item.addedBy?.name,
                    });
                  });
                });
                // Ordenar por data decrescente e pegar os 8 mais recentes
                const sortedEvents = allEvents
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .slice(0, 8);

                if (sortedEvents.length === 0) {
                  return (
                    <p className="text-sm text-slate-400 text-center py-8">
                      Nenhuma atividade registrada
                    </p>
                  );
                }

                return (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sortedEvents.map((event, idx) => {
                      if (event.type === "opened") {
                        return (
                          <div
                            key={`event-${idx}`}
                            className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
                          >
                            <div className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-200">
                              <FaPlus className="text-blue-700 text-xs" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-700">
                                {event.customer}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                  Comanda aberta
                                  {event.byName ? ` por ${event.byName}` : ""}
                                </span>
                                <p className="text-xs text-slate-400">
                                  {formatDateTime(event.date)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (event.type === "closed") {
                        return (
                          <div
                            key={`event-${idx}`}
                            className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition"
                          >
                            <div className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200">
                              <FaLock className="text-purple-700 text-xs" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-700">
                                {event.customer}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                                  Comanda fechada
                                  {event.byName ? ` por ${event.byName}` : ""}
                                </span>
                                <p className="text-xs text-slate-400">
                                  {formatDateTime(event.date)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (event.type === "sale") {
                        return (
                          <div
                            key={`event-${idx}`}
                            className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition"
                          >
                            <div className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-200">
                              <FaCheckCircle className="text-emerald-700 text-xs" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-700 truncate">
                                  {event.product}
                                </p>
                                <span className="text-xs font-bold text-emerald-700 tabular-nums flex-shrink-0">
                                  R${" "}
                                  {event.total?.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                                  {event.quantity}× vendido
                                </span>
                                <p className="text-xs text-slate-400">
                                  {formatDateTime(event.date)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (event.type === "item") {
                        return (
                          <div
                            key={`event-${idx}`}
                            className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"
                          >
                            <div className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-200">
                              <FaClipboardList className="text-indigo-700 text-xs" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    {event.product}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    para{" "}
                                    <span className="font-medium">
                                      {event.customer}
                                    </span>
                                    {event.byName && (
                                      <>
                                        {" "}
                                        · adicionado por{" "}
                                        <span className="font-medium">
                                          {event.byName}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-medium">
                                  {event.quantity}× na comanda
                                </span>
                                <p className="text-xs text-slate-400">
                                  {formatDateTime(event.date)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                );
              })()}
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}

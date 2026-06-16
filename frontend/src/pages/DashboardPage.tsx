/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { api } from '../services/api'

import {
  FaDollarSign,
  FaMoneyBillWave,
  FaUsers,
  FaClipboardList,
  FaBox,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaCircle,
} from 'react-icons/fa'

type Product = {
  id: number
  name: string
  stock: number
}

type CommandItem = {
  id: number
  quantity: number
  product: {
    id: number
    name: string
  }
}

type Command = {
  id: number
  customer: string
  total: number
  closed: boolean
  createdAt: string
  closedAt?: string | null
  items: CommandItem[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent,
  badge,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accent: string
  badge?: { label: string; positive?: boolean }
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-base ${accent}`}
        >
          {icon}
        </div>
      </div>

      <div>
        <p className="text-3xl font-extrabold text-slate-800 tabular-nums leading-none">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>

      {badge && (
        <div className="mt-auto">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              badge.positive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-500'
            }`}
          >
            <FaCircle className="text-[6px]" />
            {badge.label}
          </span>
        </div>
      )}
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-base font-bold text-slate-700 mb-5 flex items-center gap-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function StockBar({ stock }: { stock: number }) {
  const max = 10
  const pct = Math.min((stock / max) * 100, 100)
  const color =
    stock === 0
      ? 'bg-red-500'
      : stock <= 3
      ? 'bg-rose-400'
      : stock <= 7
      ? 'bg-amber-400'
      : 'bg-emerald-400'

  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div
        className={`${color} h-1.5 rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [commands, setCommands] = useState<Command[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
      const [productsResponse, commandsResponse] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Command[]>('/commands'),
      ])
      setProducts(productsResponse.data)
      setCommands(commandsResponse.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const totalProdutos = products.length

  const totalRevenue = commands.reduce((acc, c) => acc + c.total, 0)

  const closedCommands = commands.filter((c) => c.closed)
  const openCommands = commands.filter((c) => !c.closed)

  const totalArrecadado = closedCommands.reduce((acc, c) => acc + c.total, 0)
  const totalEmAberto = openCommands.reduce((acc, c) => acc + c.total, 0)

  const percentualFechadas =
    commands.length > 0
      ? (closedCommands.length / commands.length) * 100
      : 0

  const ticketMedio = commands.length > 0 ? totalRevenue / commands.length : 0

  const criticalStock = products
    .filter((p) => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)

  const ranking: Record<string, number> = {}
  commands.forEach((command) => {
    command.items.forEach((item) => {
      ranking[item.product.name] =
        (ranking[item.product.name] || 0) + item.quantity
    })
  })
  const mostRequestedProducts = Object.entries(ranking)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const maxQty = mostRequestedProducts[0]?.[1] ?? 1

  const recentActivity = commands
    .flatMap((command) => [
      { type: 'opened', customer: command.customer, date: command.createdAt },
      ...(command.closedAt
        ? [{ type: 'closed', customer: command.customer, date: command.closedAt }]
        : []),
    ])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium">Carregando dados…</p>
          </div>
        </div>
      </>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-10">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                Visão Geral
              </p>
              <h1 className="text-4xl font-extrabold text-slate-800 leading-none">
                Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-400 capitalize">{today}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            <StatCard
              title="Participantes"
              value={commands.length}
              subtitle={`${openCommands.length} comanda${openCommands.length !== 1 ? 's' : ''} em aberto`}
              icon={<FaUsers />}
              accent="bg-indigo-500"
              badge={{ label: 'Clientes ativos', positive: true }}
            />
            <StatCard
              title="Arrecadado"
              value={`R$ ${totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle={`${closedCommands.length} comanda${closedCommands.length !== 1 ? 's' : ''} fechada${closedCommands.length !== 1 ? 's' : ''}`}
              icon={<FaMoneyBillWave />}
              accent="bg-emerald-500"
              badge={{ label: 'Confirmado', positive: true }}
            />
            <StatCard
              title="Em Aberto"
              value={`R$ ${totalEmAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle="Aguardando fechamento"
              icon={<FaDollarSign />}
              accent="bg-amber-500"
              badge={{ label: 'Pendente', positive: false }}
            />
            <StatCard
              title="Ticket Médio"
              value={`R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle="Por comanda"
              icon={<FaClipboardList />}
              accent="bg-sky-500"
            />
            <StatCard
              title="Produtos"
              value={totalProdutos}
              subtitle={`${criticalStock.length} com estoque crítico`}
              icon={<FaBox />}
              accent="bg-violet-500"
              badge={
                criticalStock.length > 0
                  ? { label: `${criticalStock.length} crítico${criticalStock.length > 1 ? 's' : ''}`, positive: false }
                  : undefined
              }
            />
            <StatCard
              title="Taxa de Fechamento"
              value={`${percentualFechadas.toFixed(0)}%`}
              subtitle={`${closedCommands.length} de ${commands.length} comandas`}
              icon={<FaChartLine />}
              accent="bg-pink-500"
              badge={{
                label: percentualFechadas >= 50 ? 'Acima de 50%' : 'Abaixo de 50%',
                positive: percentualFechadas >= 50,
              }}
            />
          </div>

          {/* Analysis Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Estoque Crítico */}
            <SectionCard title="⚠️ Estoque Crítico">
              {criticalStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300 gap-2">
                  <FaCheckCircle className="text-3xl text-emerald-300" />
                  <p className="text-sm text-slate-400">Nenhum produto crítico</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {criticalStock.map((product) => (
                    <div key={product.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[70%]">
                          {product.name}
                        </span>
                        <span
                          className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md ${
                            product.stock === 0
                              ? 'bg-red-100 text-red-600'
                              : product.stock <= 3
                              ? 'bg-rose-50 text-rose-500'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {product.stock === 0 ? 'Esgotado' : `${product.stock} un.`}
                        </span>
                      </div>
                      <StockBar stock={product.stock} />
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Itens Mais Pedidos */}
            <SectionCard title="🏆 Mais Pedidos">
              {mostRequestedProducts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Nenhum pedido registrado
                </p>
              ) : (
                <div className="space-y-4">
                  {mostRequestedProducts.map(([name, qty], i) => (
                    <div key={name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                              i === 0
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-700 truncate max-w-40">
                            {name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 tabular-nums">
                          {qty}×
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            i === 0 ? 'bg-indigo-500' : 'bg-indigo-200'
                          }`}
                          style={{ width: `${(qty / maxQty) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Atividade Recente */}
            <SectionCard title="🕐 Atividade Recente">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Nenhuma atividade recente
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0"
                    >
                      <div
                        className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          activity.type === 'closed'
                            ? 'bg-emerald-50'
                            : 'bg-indigo-50'
                        }`}
                      >
                        {activity.type === 'closed' ? (
                          <FaCheckCircle className="text-emerald-500 text-xs" />
                        ) : (
                          <FaExclamationTriangle className="text-indigo-400 text-xs" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 leading-tight truncate">
                          {activity.customer}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {activity.type === 'closed'
                            ? 'Comanda fechada'
                            : 'Nova comanda aberta'}{' '}
                          · {formatDateTime(activity.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

          </div>
        </div>
      </div>
    </>
  )
}
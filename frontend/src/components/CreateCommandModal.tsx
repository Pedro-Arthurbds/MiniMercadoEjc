import { useState } from 'react'
import { api } from '../services/api'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateCommandModal({ isOpen, onClose, onCreated }: Props) {
  const [customer, setCustomer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  function handleClose() {
    setCustomer('')
    setError('')
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = customer.trim()
    if (!trimmed) {
      setError('Informe o nome do cliente.')
      return
    }

    try {
      setLoading(true)
      setError('')
      await api.post('/commands', { customer: trimmed })
      onCreated()
      handleClose()
    } catch {
      setError('Erro ao criar comanda. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Nova comanda</h2>
            <p className="text-sm text-slate-400 mt-0.5">Informe o nome do cliente para abrir</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label
              htmlFor="customer"
              className="block text-sm font-semibold text-slate-600 mb-1.5"
            >
              Nome do cliente
            </label>
            <input
              id="customer"
              type="text"
              autoFocus
              placeholder="Ex: João Silva"
              value={customer}
              onChange={(e) => {
                setCustomer(e.target.value)
                if (error) setError('')
              }}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:bg-white transition ${
                error
                  ? 'border-red-300 focus:ring-red-300'
                  : 'border-slate-200 focus:ring-indigo-400'
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !customer.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando…
                </>
              ) : (
                'Criar comanda'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

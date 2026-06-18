import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

type Product = {
  id: number;
  name: string;
  price: number;
};

type CommandItem = {
  id: number;
  quantity: number;
  product: Product;
};

type PublicCommand = {
  id: number;
  customer: string;
  total: number;
  closed: boolean;
  createdAt: string;
  items: CommandItem[];
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PublicCommandPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [command, setCommand] = useState<PublicCommand | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/c/${code}`)
      .then((r) => setCommand(r.data))
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [code]);

  // Se o usuário estiver logado como Minimercado ou Admin,
  // redireciona pra página interna onde pode adicionar itens
  useEffect(() => {
    if (!loading && command && user) {
      if (user.role === "ADMIN" || user.role === "MINIMERCADO") {
        navigate(`/commands/${command.id}`, { replace: true });
      }
    }
  }, [loading, command, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">
            Carregando comanda…
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !command) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-slate-700 mb-2">
            Comanda não encontrada
          </h1>
          <p className="text-sm text-slate-400">
            O link pode estar incorreto ou a comanda foi removida.
          </p>
        </div>
      </div>
    );
  }

  // Página pública — cliente não logado
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Botão de login para atendentes */}
        <button
          onClick={() =>
            navigate("/login", { state: { returnTo: `/c/${code}` } })
          }
          className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-white hover:text-slate-700 transition-colors"
        >
          Entrar como MiniMercado
        </button>
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                Comanda #{command.id}
              </p>
              <h1 className="text-2xl font-extrabold text-slate-800 leading-none">
                {command.customer}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(command.createdAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <span
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl ${
                command.closed
                  ? "bg-slate-100 text-slate-500"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {command.closed ? "Fechada" : "Aberta"}
            </span>
          </div>
        </div>

        {/* Itens */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Itens
          </h2>

          {command.items.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Nenhum item ainda
            </p>
          ) : (
            <div className="space-y-3">
              {command.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.quantity}× · {formatCurrency(item.product.price)}{" "}
                      cada
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-700 tabular-nums">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {formatCurrency(command.total)}
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6">
          Mini Mercado · visualização pública
        </p>
      </div>
    </div>
  );
}

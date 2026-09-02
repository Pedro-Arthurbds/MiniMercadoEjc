/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUserPlus,
  FaUsers,
  FaEdit,
  FaTrash,
  FaKey,
  FaCheck,
} from "react-icons/fa";

type Role = "ADMIN" | "MINIMERCADO" | "SECRETARIA";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
};

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  MINIMERCADO: "Minimercado",
  SECRETARIA: "Secretaria",
};

const roleColors: Record<Role, string> = {
  ADMIN: "bg-slate-800 text-white",
  MINIMERCADO: "bg-emerald-100 text-emerald-700",
  SECRETARIA: "bg-indigo-100 text-indigo-700",
};

type ResetRequest = {
  id: number;
  email: string;
  status: "PENDING" | "RESOLVED";
  createdAt: string;
  resolvedBy: { id: number; name: string } | null;
};

export function UsersPage() {
  const { user: loggedUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MINIMERCADO");
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  async function loadResetRequests() {
    try {
      const r = await api.get<ResetRequest[]>("/password-reset-requests");
      setResetRequests(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadUsers() {
    try {
      const r = await api.get<User[]>("/users");
      setUsers(r.data);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    void loadResetRequests();
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("MINIMERCADO");
    setMustChangePassword(false);
    setEditingUser(null);
  }

  function handleNewClick() {
    if (showForm && !editingUser) {
      setShowForm(false);
      return;
    }
    resetForm();
    setShowForm(true);
  }

  function handleEditClick(u: User) {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setMustChangePassword(u.mustChangePassword);
    setShowForm(true);
  }

  function handleResetFromRequest(request: ResetRequest) {
    const matchingUser = users.find(
      (u) => u.email.toLowerCase() === request.email.toLowerCase(),
    );
    if (matchingUser) {
      handleEditClick(matchingUser);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Nenhum usuário cadastrado com esse e-mail");
    }
  }

  async function handleResolveRequest(request: ResetRequest) {
    setResolvingId(request.id);
    try {
      await api.put(`/password-reset-requests/${request.id}/resolve`);
      toast.success("Solicitação marcada como resolvida");
      void loadResetRequests();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? "Erro ao resolver solicitação";
      toast.error(msg);
    } finally {
      setResolvingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          name,
          email,
          role,
          mustChangePassword,
        };
        if (password) payload.password = password;
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success("Usuário atualizado");
      } else {
        await api.post("/users", {
          name,
          email,
          password,
          role,
          mustChangePassword,
        });
        toast.success("Usuário criado com sucesso");
      }
      resetForm();
      setShowForm(false);
      void loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Erro ao salvar usuário";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u: User) {
    if (loggedUser?.id === u.id) {
      toast.error("Você não pode remover seu próprio usuário");
      return;
    }
    if (
      !window.confirm(
        `Remover o usuário "${u.name}"? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    try {
      await api.delete(`/users/${u.id}`);
      toast.success("Usuário removido");
      void loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Erro ao remover usuário";
      toast.error(msg);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-400">
              Carregando usuários…
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
                Administração
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-none">
                Usuários
              </h1>
            </div>
            <button
              onClick={handleNewClick}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              <FaUserPlus className="text-xs" />
              {showForm && !editingUser ? "Cancelar" : "Novo usuário"}
            </button>
          </div>

          {resetRequests.some((r) => r.status === "PENDING") && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FaKey className="text-amber-500 text-sm" />
                <h2 className="text-sm font-bold text-amber-800">
                  Pedidos de redefinição de senha
                </h2>
                <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  {resetRequests.filter((r) => r.status === "PENDING").length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {resetRequests
                  .filter((r) => r.status === "PENDING")
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 border border-amber-100"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {r.email}
                        </p>
                        <p className="text-xs text-slate-400">
                          Pedido em{" "}
                          {new Date(r.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResetFromRequest(r)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition active:scale-95"
                        >
                          <FaKey className="text-[10px]" />
                          Redefinir senha
                        </button>
                        <button
                          onClick={() => void handleResolveRequest(r)}
                          disabled={resolvingId === r.id}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition active:scale-95"
                        >
                          <FaCheck className="text-[10px]" />
                          Marcar resolvida
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {showForm && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-6">
              <h2 className="text-sm font-bold text-slate-700 mb-4">
                {editingUser
                  ? `Editar usuário — ${editingUser.name}`
                  : "Cadastrar novo usuário"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {editingUser ? "Nova senha (opcional)" : "Senha"}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    minLength={6}
                    placeholder={
                      editingUser ? "Deixe em branco para manter" : ""
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Papel
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="MINIMERCADO">Minimercado</option>
                    <option value="SECRETARIA">Secretaria</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <label className="sm:col-span-2 flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mustChangePassword}
                    onChange={(e) => setMustChangePassword(e.target.checked)}
                    className="h-4 w-4 accent-indigo-500"
                  />
                  Solicitar troca de senha no primeiro acesso
                </label>

                <div className="sm:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                  >
                    {saving
                      ? "Salvando…"
                      : editingUser
                        ? "Salvar alterações"
                        : "Criar usuário"}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setShowForm(false);
                      }}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <FaUsers className="text-4xl text-slate-300" />
                <p className="text-sm text-slate-400">
                  Nenhum usuário cadastrado ainda
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-5 py-3 font-semibold text-slate-400 uppercase text-xs tracking-wider">
                      Nome
                    </th>
                    <th className="px-5 py-3 font-semibold text-slate-400 uppercase text-xs tracking-wider">
                      Email
                    </th>
                    <th className="px-5 py-3 font-semibold text-slate-400 uppercase text-xs tracking-wider">
                      Papel
                    </th>
                    <th className="px-5 py-3 font-semibold text-slate-400 uppercase text-xs tracking-wider text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-5 py-3 font-semibold text-slate-700">
                        {u.name}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${roleColors[u.role]}`}
                        >
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition"
                            title="Editar"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={loggedUser?.id === u.id}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title={
                              loggedUser?.id === u.id
                                ? "Você não pode remover seu próprio usuário"
                                : "Remover"
                            }
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
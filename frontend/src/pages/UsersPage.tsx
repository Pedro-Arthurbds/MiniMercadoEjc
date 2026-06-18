import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { FaUserPlus, FaUsers, FaEdit, FaTrash } from "react-icons/fa";

type Role = "ADMIN" | "MINIMERCADO" | "SECRETARIA";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
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
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("MINIMERCADO");
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
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = { name, email, role };
        if (password) payload.password = password;
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success("Usuário atualizado");
      } else {
        await api.post("/users", { name, email, password, role });
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowRight, FaKey } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export function ChangePasswordPage() {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(password);
      toast.success("Senha cadastrada com sucesso");
      navigate(user?.role === "ADMIN" ? "/" : "/products", { replace: true });
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error ?? "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <main className="change-password-card">
        <div className="change-password-icon"><FaKey /></div>
        <p className="login-kicker">Primeiro acesso</p>
        <h1 className="login-title">Crie sua senha pessoal</h1>
        <p className="login-subtitle">
          Por segurança, escolha uma nova senha antes de entrar no sistema.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="login-label" htmlFor="new-password">Nova senha</label>
            <input
              id="new-password"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="login-input"
              autoFocus
            />
          </div>
          <div>
            <label className="login-label" htmlFor="confirm-password">Confirmar senha</label>
            <input
              id="confirm-password"
              type="password"
              minLength={6}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="login-input"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={loading} className="login-submit">
            <span>{loading ? "Salvando..." : "Salvar minha senha"}</span>
            <FaArrowRight />
          </button>
          <button type="button" onClick={logout} className="login-back-link">
            Sair desta conta
          </button>
        </form>
      </main>
    </div>
  );
}

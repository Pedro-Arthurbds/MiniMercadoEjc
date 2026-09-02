import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaEnvelope,
  FaLock,
  FaShoppingBasket,
} from "react-icons/fa";

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/password-reset-requests", { email });
      setSent(true);
    } catch {
      setError("Não foi possível enviar sua solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return <div className="forgot-success">
      <div className="forgot-success-icon"><FaCheck /></div>
      <h3 className="forgot-success-title">Pedido enviado</h3>
        <p className="login-helper-text">
          Se esse e-mail estiver cadastrado, um administrador foi avisado e
          vai te ajudar a redefinir a senha em breve.
        </p>
        <button
          onClick={onBack}
          className="login-back-link"
        >
          <FaArrowLeft className="text-xs" />
          Voltar para o login
        </button>
      </div>;
  }

  return (
    <form onSubmit={handleSubmit} className="forgot-form flex flex-col gap-4">
      <div className="forgot-instruction">
        <span className="forgot-instruction-icon"><FaEnvelope /></span>
        <p className="login-helper-text login-helper-intro">
        Informe seu e-mail. Um administrador vai ver o pedido e redefinir sua
        senha manualmente.
        </p>
      </div>
      <div>
        <label className="login-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="login-input"
        />
      </div>

      {error && <p className="login-error">{error}</p>}

      <button type="submit" disabled={loading} className="login-submit">
        <span>{loading ? "Enviando..." : "Solicitar redefinição"}</span>
        <FaArrowRight />
      </button>
      <button
        type="button"
        onClick={onBack}
        className="login-back-link"
      >
        <FaArrowLeft className="text-xs" />
        Voltar para o login
      </button>
    </form>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string })?.returnTo;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate(loggedUser.role === "ADMIN" ? "/" : "/products");
      }
    } catch {
      setError("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-layout">
        <aside className="login-brand-panel">
          <div className="login-brand-mark" aria-label="Mini Mercado EJC">
            <span className="login-brand-icon"><FaShoppingBasket /></span>
            <span>EJC</span>
          </div>
          <div className="login-brand-copy">
            <p className="login-kicker">Mini Mercado</p>
          </div>
          <div className="login-brand-footer">
            <span className="login-footer-line" />
            <span>Gestão simples para a comunidade EJC</span>
          </div>
        </aside>
        <main className="login-form-panel">
          <div className="login-form-header">
            <div className="login-mobile-mark"><FaShoppingBasket /></div>
            <span className="login-eyebrow"><FaLock /> Área restrita</span>
          </div>
        {showForgot ? (
          <>
            <h2 className="login-title">
              Esqueci minha senha
            </h2>
            <p className="login-subtitle">Vamos ajudar você a recuperar o acesso.</p>
            <ForgotPasswordForm onBack={() => setShowForgot(false)} />
          </>
        ) : (
          <>
            <h2 className="login-title">Boas-vindas</h2>
            <p className="login-subtitle">Entre para continuar sua operação.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="login-label">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="login-label">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="login-forgot"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-500 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="login-submit"
              >
                <span>{loading ? "Entrando..." : "Entrar"}</span>
                <FaArrowRight />
              </button>
            </form>
          </>
        )}
          <p className="login-form-note">Acesso seguro para a equipe do Mini Mercado EJC.</p>
        </main>
      </div>
    </div>
  );
}
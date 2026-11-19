import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";
import { api } from "../utils/api";
import type { ThemeMode, User } from "../types";

export default function AuthPage({
  mode,
  onAuthenticated,
  theme,
  onToggleTheme,
}: {
  mode: "login" | "register";
  onAuthenticated: (user: User) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  const register = mode === "register";
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    if (register && password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    try {
      const { user } = await api<{ user: User }>(
        `/auth/${register ? "register" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify(
            register ? { name, email, password } : { email, password },
          ),
        },
      );
      onAuthenticated(user);
      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art">
        <Brand light />
        <div className="auth-art-content">
          <span className="eyebrow">UM NOVO JEITO DE CUIDAR</span>
          <h1>
            Mais leveza
            <br />
            para sua vida
            <br />
            <em>financeira.</em>
          </h1>
          <p>
            Organize suas contas e aproveite a tranquilidade de saber que está
            tudo sob controle.
          </p>
          <div className="auth-art-footer">
            <ShieldCheck size={17} /> Seus dados protegidos e privados
          </div>
        </div>
        <div className="auth-orb" />
      </div>
      <div className="auth-form-side">
        <div className="auth-top-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
          <Link className="auth-back" to="/">
            ← Voltar ao início
          </Link>
        </div>
        <div className="auth-form-wrap">
          <span className="eyebrow">
            {register ? "VAMOS COMEÇAR" : "QUE BOM TER VOCÊ DE VOLTA"}
          </span>
          <h2>{register ? "Crie sua conta" : "Boas-vindas de volta"}</h2>
          <p className="auth-subtitle">
            {register
              ? "É rapidinho. E o primeiro passo para uma vida mais leve."
              : "Entre para continuar cuidando bem do seu dinheiro."}
          </p>
          <form className="auth-form" onSubmit={submit}>
            {register && (
              <label>
                Seu nome
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </label>
            )}
            <label>
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                required
              />
            </label>
            <label>
              Senha
              <input
                name="password"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                placeholder="Mínimo de 8 caracteres"
                minLength={8}
                required
              />
            </label>
            {register && (
              <label>
                Confirme sua senha
                <input
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Digite sua senha novamente"
                  minLength={8}
                  required
                />
              </label>
            )}
            {error && (
              <div role="alert" className="form-error">
                {error}
              </div>
            )}
            <button
              className="button button-dark auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? "Aguarde..." : register ? "Criar minha conta" : "Entrar"}{" "}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {register ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
            <Link to={register ? "/login" : "/register"}>
              {register ? "Entrar" : "Criar conta"}
            </Link>
          </p>
          <div className="auth-privacy">
            <LockKeyhole size={14} /> Seus dados são criptografados e nunca
            compartilhados.
          </div>
        </div>
      </div>
    </main>
  );
}

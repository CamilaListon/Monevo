import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  CheckCircle2,
  ImagePlus,
  KeyRound,
  LockKeyhole,
  Menu,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import Sidebar from "../components/Sidebar";
import { api, apiUrl } from "../utils/api";
import type { ThemeMode, User } from "../types";

export default function AccountPage({
  user,
  onUserUpdated,
  theme,
  onToggleTheme,
  onLogout,
}: {
  user: User;
  onUserUpdated: (user: User) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function clearFeedback() {
    setError("");
    setNotice("");
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setBusy("name");
    try {
      const { user: updatedUser } = await api<{ user: User }>("/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      setName(updatedUser.name);
      onUserUpdated(updatedUser);
      setNotice("Seu nome foi atualizado.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar seu nome.",
      );
    } finally {
      setBusy("");
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    if (newPassword !== confirmation) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }
    setBusy("password");
    try {
      await api<void>("/profile/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      form.reset();
      setNotice("Sua senha foi alterada.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível alterar sua senha.",
      );
    } finally {
      setBusy("");
    }
  }

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    clearFeedback();
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Escolha uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setAvatarFile(file);
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    clearFeedback();
    setBusy("avatar");
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    try {
      const { user: updatedUser } = await api<{ user: User }>(
        "/profile/avatar",
        {
          method: "POST",
          body: formData,
        },
      );
      onUserUpdated(updatedUser);
      setAvatarFile(null);
      setNotice("Sua foto de perfil foi atualizada.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setBusy("");
    }
  }

  async function removeAvatar() {
    clearFeedback();
    setBusy("avatar");
    try {
      await api<void>("/profile/avatar", { method: "DELETE" });
      onUserUpdated({ ...user, avatarUrl: null });
      setAvatarFile(null);
      setNotice("Sua foto de perfil foi removida.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível remover a imagem.",
      );
    } finally {
      setBusy("");
    }
  }

  async function logout() {
    try {
      await api<void>("/auth/logout", { method: "POST" });
      onLogout();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível encerrar a sessão.",
      );
    }
  }

  const avatarSrc =
    previewUrl ?? (user.avatarUrl ? apiUrl(user.avatarUrl) : null);

  return (
    <div className="dashboard-shell">
      <Sidebar
        page="account"
        mobileMenu={mobileMenu}
        onClose={() => setMobileMenu(false)}
        onLogout={() => void logout()}
      />
      {mobileMenu && (
        <button
          className="mobile-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <main className="dashboard-main">
        <header className="dash-topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Abrir menu"
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            Seu espaço <span>/</span> <b>Minha conta</b>
          </div>
          <div className="topbar-right">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
            <Link className="user-profile-link" to="/dashboard">
              <div className="user-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} crossOrigin="use-credentials" alt="" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="user-meta">
                <b>{user.name.split(" ")[0]}</b>
                <span>Voltar ao painel</span>
              </div>
            </Link>
          </div>
        </header>
        <div className="dashboard-content account-content">
          <div className="welcome-row account-welcome">
            <div>
              <div className="welcome-date">SEU PERFIL</div>
              <h1>Minha conta</h1>
              <p>Gerencie seus dados pessoais e sua segurança.</p>
            </div>
          </div>
          {error && (
            <div role="alert" className="dashboard-error">
              {error}
              <button onClick={() => setError("")}>
                <X size={15} />
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="account-notice">
              <CheckCircle2 size={17} />
              {notice}
              <button onClick={() => setNotice("")} aria-label="Fechar aviso">
                <X size={15} />
              </button>
            </div>
          )}
          <div className="account-grid">
            <section className="panel account-panel">
              <div className="account-panel-heading">
                <span className="account-section-icon">
                  <UserRound size={19} />
                </span>
                <div>
                  <h2>Dados pessoais</h2>
                  <p>Seu perfil e como aparece no Monevo.</p>
                </div>
              </div>
              <div className="account-avatar-row">
                <div className="profile-avatar">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      crossOrigin="use-credentials"
                      alt={`Foto de ${user.name}`}
                    />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="profile-avatar-details">
                  <b>Foto de perfil</b>
                  <span>JPEG, PNG ou WebP. Até 5 MB.</span>
                  <div className="avatar-actions">
                    <label
                      className="button button-quiet avatar-select"
                      htmlFor="avatar-file"
                    >
                      <ImagePlus size={16} /> Escolher foto
                    </label>
                    <input
                      id="avatar-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={selectAvatar}
                    />
                    {avatarFile && (
                      <button
                        className="button button-dark avatar-save"
                        type="button"
                        onClick={() => void uploadAvatar()}
                        disabled={busy === "avatar"}
                      >
                        <Upload size={15} />
                        {busy === "avatar" ? "Enviando..." : "Enviar foto"}
                      </button>
                    )}
                    {user.avatarUrl && (
                      <button
                        className="avatar-remove"
                        type="button"
                        onClick={() => void removeAvatar()}
                        disabled={busy === "avatar"}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <form className="account-form" onSubmit={saveName}>
                <label>
                  Nome completo
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                    autoComplete="name"
                  />
                </label>
                <label>
                  E-mail
                  <input
                    value={user.email}
                    disabled
                    readOnly
                    autoComplete="email"
                  />
                  <small>O e-mail não pode ser alterado por aqui.</small>
                </label>
                <button
                  className="button button-dark account-save"
                  type="submit"
                  disabled={busy === "name" || name.trim() === user.name}
                >
                  <Save size={16} />
                  {busy === "name" ? "Salvando..." : "Salvar alterações"}
                </button>
              </form>
            </section>
            <section className="panel account-panel security-panel">
              <div className="account-panel-heading">
                <span className="account-section-icon security-icon">
                  <KeyRound size={19} />
                </span>
                <div>
                  <h2>Segurança</h2>
                  <p>Atualize sua senha para manter sua conta protegida.</p>
                </div>
              </div>
              <form
                className="account-form password-form"
                onSubmit={changePassword}
              >
                <label>
                  Senha atual
                  <input
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </label>
                <label>
                  Nova senha
                  <input
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                  <small>Use pelo menos 8 caracteres.</small>
                </label>
                <label>
                  Confirme a nova senha
                  <input
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </label>
                <button
                  className="button button-dark account-save"
                  type="submit"
                  disabled={busy === "password"}
                >
                  <LockKeyhole size={16} />
                  {busy === "password" ? "Atualizando..." : "Alterar senha"}
                </button>
              </form>
            </section>
          </div>
          <footer className="dashboard-footer">
            <span>© 2025 Monevo · Seu dinheiro, no ritmo certo.</span>
            <span>
              <ShieldCheck size={14} /> Seus dados são privados
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

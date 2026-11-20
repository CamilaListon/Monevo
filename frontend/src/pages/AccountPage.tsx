import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ImagePlus,
  KeyRound,
  LockKeyhole,
  Menu,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import AlertDialog from "../components/AlertDialog";
import ThemeToggle from "../components/ThemeToggle";
import Sidebar from "../components/Sidebar";
import { api, apiUrl } from "../utils/api";
import type { ThemeMode, User } from "../types";
import {
  buttonBaseClasses,
  buttonDarkClasses,
  buttonQuietClasses,
  formFieldClasses,
} from "../utils/tailwind";

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
    <div className="min-h-screen bg-[#f5f6f2] dark:bg-dark-canvas">
      <Sidebar
        page="account"
        mobileMenu={mobileMenu}
        onClose={() => setMobileMenu(false)}
        onLogout={() => void logout()}
      />
      {mobileMenu && (
        <button
          className="hidden max-[820px]:fixed max-[820px]:inset-0 max-[820px]:z-[12] max-[820px]:block max-[820px]:bg-[#12251f99]"
          aria-label="Fechar menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <main className="ml-[232px] min-h-screen max-[1080px]:ml-[205px] max-[820px]:ml-0">
        <header className="flex h-[68px] items-center justify-between border-b border-[#e9ede6] bg-white px-[37px] dark:border-dark-border dark:bg-dark-raised max-[1080px]:px-6 max-[820px]:h-[61px] max-[820px]:px-[18px] max-[600px]:px-3">
          <button
            className="hidden border-0 bg-transparent text-[#456057] dark:text-[#c0d0c6] max-[820px]:grid max-[820px]:place-items-center"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Abrir menu"
          >
            <Menu size={21} />
          </button>
          <div className="mr-auto text-xs text-[#98a39d] max-[820px]:ml-[11px] max-[600px]:text-[10px]">
            Seu espaço <span className="px-2 text-[#c3cbc4]">/</span>{" "}
            <b className="font-semibold text-[#506159] dark:text-[#e2ece5]">
              Perfil
            </b>
          </div>
          <div className="flex items-center gap-3 max-[600px]:gap-[7px]">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
            <Link className="flex items-center gap-[9px]" to="/dashboard">
              <div className="grid size-[31px] place-items-center overflow-hidden rounded-full bg-[#e2f0e9] font-display text-xs font-semibold text-[#0a675d] dark:bg-[#20372d] dark:text-[#a9e3ce]">
                {avatarSrc ? (
                  <img src={avatarSrc} crossOrigin="use-credentials" alt="" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="max-[600px]:hidden">
                <b className="block text-xs font-semibold text-[#31443e] dark:text-[#e2ece5]">
                  {user.name.split(" ")[0]}
                </b>
                <span className="mt-[3px] block text-[10px] text-[#96a19b]">
                  Voltar ao painel
                </span>
              </div>
            </Link>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1080px] px-[37px] pb-5 pt-[31px] max-[1080px]:px-6 max-[820px]:max-w-[740px] max-[820px]:px-5 max-[820px]:py-[25px] max-[600px]:px-[13px] max-[600px]:pb-4 max-[600px]:pt-[21px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[12px] font-bold tracking-[1.1px] text-teal">
                SEU PERFIL
              </div>
              <h1 className="mb-0 mt-[5px] font-display text-[25px] font-semibold tracking-[-0.6px] text-[#123d33] dark:text-[#e5eee8] max-[600px]:text-[21px]">
                Perfil
              </h1>
              <p className="m-0 text-[12px] text-[#7b8881] dark:text-[#a5b5ac] max-[600px]:text-[10px]">
                Gerencie seus dados pessoais e sua segurança.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(310px,0.9fr)] gap-4 max-[820px]:grid-cols-1">
            <section className="min-w-0 rounded-[11px] border border-[#e9ede6] bg-white p-[23px] dark:border-dark-border dark:bg-dark-surface max-[600px]:p-[17px]">
              <div className="flex items-center gap-3 border-b border-[#edf0eb] pb-[19px] dark:border-dark-border">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f2ec] text-teal dark:bg-[#20372d] dark:text-[#94dfc7]">
                  <UserRound size={19} />
                </span>
                <div>
                  <h2 className="m-0 font-display text-[18px] font-semibold text-[#173d33] dark:text-[#e2ece5]">
                    Dados pessoais
                  </h2>
                  <p className="mb-0 mt-1 text-[12px] leading-[1.5] text-[#87938c] dark:text-[#a5b5ac]">
                    Seu perfil e como aparece no Monevo.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[17px] border-b border-[#edf0eb] py-[22px] dark:border-dark-border max-[600px]:items-start max-[600px]:gap-3">
                <div className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-full border border-[#dfeae2] bg-[#e4f0e9] text-[28px] text-[#0a6e63] dark:border-[#385448] dark:bg-[#20372d] dark:text-[#a9e3ce] max-[600px]:size-16">
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
                <div className="min-w-0">
                  <b className="block text-[14px] text-[#334a40] dark:text-[#e2ece5]">
                    Foto de perfil
                  </b>
                  <span className="mt-[5px] block text-[12px] text-[#89968f] dark:text-[#a5b5ac]">
                    JPEG, PNG ou WebP. Até 5 MB.
                  </span>
                  <div className="mt-[11px] flex flex-wrap items-center gap-2 max-[600px]:gap-[6px]">
                    <label
                      className={`${buttonBaseClasses} ${buttonQuietClasses} min-h-[34px] cursor-pointer px-[10px] text-[12px] max-[600px]:px-2 max-[600px]:text-[10px]`}
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
                        className={`${buttonBaseClasses} ${buttonDarkClasses} min-h-[34px] px-[10px] text-[12px] max-[600px]:px-2 max-[600px]:text-[10px]`}
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
                        className="min-h-8 border-0 bg-transparent px-[6px] text-[12px] font-semibold text-[#c15a40] hover:text-[#e05e3c] hover:underline dark:text-[#ffb49a]"
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
              <form
                className="flex flex-col gap-[15px] pt-5"
                onSubmit={saveName}
              >
                <label className="flex flex-col gap-[7px] text-[12px] font-semibold text-[#334940] dark:text-[#d7e3da]">
                  Nome completo
                  <input
                    className={`${formFieldClasses} min-h-[43px] px-3 text-[14px]`}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                    autoComplete="name"
                  />
                </label>
                <label className="flex flex-col gap-[7px] text-[12px] font-semibold text-[#334940] dark:text-[#d7e3da]">
                  E-mail
                  <input
                    className={`${formFieldClasses} min-h-[43px] px-3 text-[14px] disabled:cursor-not-allowed disabled:bg-[#f5f7f3] disabled:text-[#829087] dark:disabled:bg-[#1c2c24] dark:disabled:text-[#9eafa5]`}
                    value={user.email}
                    disabled
                    readOnly
                    autoComplete="email"
                  />
                  <small className="text-[12px] font-normal text-[#89968f] dark:text-[#a5b5ac]">
                    O e-mail não pode ser alterado por aqui.
                  </small>
                </label>
                <button
                  className={`${buttonBaseClasses} ${buttonDarkClasses} min-h-10 self-start px-[14px] text-[12px] max-[600px]:w-full`}
                  type="submit"
                  disabled={busy === "name" || name.trim() === user.name}
                >
                  <Save size={16} />
                  {busy === "name" ? "Salvando..." : "Salvar alterações"}
                </button>
              </form>
            </section>
            <section className="min-w-0 rounded-[11px] border border-[#e9ede6] bg-white p-[23px] dark:border-dark-border dark:bg-dark-surface max-[600px]:p-[17px]">
              <div className="flex items-center gap-3 border-b border-[#edf0eb] pb-[19px] dark:border-dark-border">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-coral">
                  <KeyRound size={19} />
                </span>
                <div>
                  <h2 className="m-0 font-display text-[18px] font-semibold text-[#173d33] dark:text-[#e2ece5]">
                    Segurança
                  </h2>
                  <p className="mb-0 mt-1 text-[12px] leading-[1.5] text-[#87938c] dark:text-[#a5b5ac]">
                    Atualize sua senha para manter sua conta protegida.
                  </p>
                </div>
              </div>
              <form
                className="flex flex-col gap-[15px] pt-[22px]"
                onSubmit={changePassword}
              >
                <label className="flex flex-col gap-[7px] text-[12px] font-semibold text-[#334940] dark:text-[#d7e3da]">
                  Senha atual
                  <input
                    className={`${formFieldClasses} min-h-[43px] px-3 text-[14px]`}
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </label>
                <label className="flex flex-col gap-[7px] text-[12px] font-semibold text-[#334940] dark:text-[#d7e3da]">
                  Nova senha
                  <input
                    className={`${formFieldClasses} min-h-[43px] px-3 text-[14px]`}
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                  <small className="text-[12px] font-normal text-[#89968f] dark:text-[#a5b5ac]">
                    Use pelo menos 8 caracteres.
                  </small>
                </label>
                <label className="flex flex-col gap-[7px] text-[12px] font-semibold text-[#334940] dark:text-[#d7e3da]">
                  Confirme a nova senha
                  <input
                    className={`${formFieldClasses} min-h-[43px] px-3 text-[14px]`}
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </label>
                <button
                  className={`${buttonBaseClasses} ${buttonDarkClasses} min-h-10 self-start px-[14px] text-[12px] max-[600px]:w-full`}
                  type="submit"
                  disabled={busy === "password"}
                >
                  <LockKeyhole size={16} />
                  {busy === "password" ? "Atualizando..." : "Alterar senha"}
                </button>
              </form>
            </section>
          </div>
          <footer className="flex justify-between gap-2 px-0 pb-[3px] pt-[18px] text-[12px] text-[#9aa59e] max-[600px]:text-[9px]">
            <span>© 2025 Monevo · Seu dinheiro, no ritmo certo.</span>
            <span className="inline-flex items-center gap-[5px] text-[9px]">
              <ShieldCheck size={14} /> Seus dados são privados
            </span>
          </footer>
        </div>
      </main>
      {error && (
        <AlertDialog
          title="Não foi possível concluir"
          description={error}
          onClose={() => setError("")}
        />
      )}
      {notice && (
        <AlertDialog
          title="Tudo certo"
          description={notice}
          tone="success"
          onClose={() => setNotice("")}
        />
      )}
    </div>
  );
}

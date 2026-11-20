import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";
import { api } from "../utils/api";
import type { ThemeMode, User } from "../types";
import AlertDialog from "../components/AlertDialog";
import {
  buttonBaseClasses,
  buttonDarkClasses,
  formFieldClasses,
  formLabelClasses,
} from "../utils/tailwind";

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
    <>
      <main className="grid min-h-screen grid-cols-[42%_58%] bg-white dark:bg-dark-canvas max-[820px]:grid-cols-1">
        <div className="relative flex flex-col overflow-hidden bg-forest px-[clamp(35px,6vw,84px)] py-[34px] text-white max-[820px]:hidden">
          <Brand light />
          <div className="relative z-[1] my-auto py-[70px] pb-[75px]">
            <span className="text-[12px] font-bold tracking-[1.5px] text-[#a7d1c2]">
              UM NOVO JEITO DE CUIDAR
            </span>
            <h1 className="mb-[14px] mt-5 font-display text-[clamp(40px,4vw,54px)] font-medium leading-[1.15] tracking-[-2px]">
              Mais leveza
              <br />
              para sua vida
              <br />
              <em className="not-italic text-[#f49b72]">financeira.</em>
            </h1>
            <p className="max-w-[360px] text-xs leading-[1.85] text-[#bad1c8]">
              Organize suas contas e aproveite a tranquilidade de saber que está
              tudo sob controle.
            </p>
            <div className="absolute bottom-[35px] flex items-center gap-2 text-[12px] text-[#a9c5ba]">
              <ShieldCheck size={17} /> Seus dados protegidos e privados
            </div>
          </div>
          <div className="absolute bottom-[-240px] right-[-195px] size-[520px] rounded-full border border-[#b2d8c526]">
            <div className="absolute inset-[45px] rounded-full border border-[#b2d8c51b]" />
            <div className="absolute inset-[94px] rounded-full border border-[#b2d8c51b]" />
          </div>
        </div>
        <div className="relative grid place-items-center px-10 py-[70px] max-[820px]:min-h-screen max-[820px]:px-[25px] max-[820px]:pb-[45px] max-[820px]:pt-[70px]">
          <div className="absolute right-[45px] top-[35px] flex items-center gap-[13px] max-[820px]:right-[25px] max-[820px]:top-[25px] max-[600px]:right-5 max-[600px]:top-5">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
            <Link className="text-[12px] text-[#7e8b84] hover:text-teal" to="/">
              ← Voltar ao início
            </Link>
          </div>
          <div className="w-full max-w-[400px]">
            <span className="text-[10px] font-bold tracking-[1.5px] text-teal">
              {register ? "VAMOS COMEÇAR" : "QUE BOM TER VOCÊ DE VOLTA"}
            </span>
            <h2 className="mb-[5px] mt-[13px] font-display text-[30px] font-semibold tracking-[-0.8px] text-[#123d33] dark:text-[#e5eee8]">
              {register ? "Crie sua conta" : "Boas-vindas de volta"}
            </h2>
            <p className="mb-[27px] mt-0 text-[12px] leading-[1.7] text-[#7c8982] dark:text-[#a5b5ac]">
              {register
                ? "É rapidinho. E o primeiro passo para uma vida mais leve."
                : "Entre para continuar cuidando bem do seu dinheiro."}
            </p>
            <form className="flex flex-col gap-[15px]" onSubmit={submit}>
              {register && (
                <label className={formLabelClasses}>
                  Seu nome
                  <input
                    name="name"
                    className={`${formFieldClasses} min-h-11 text-[14px]`}
                    autoComplete="name"
                    placeholder="Como podemos te chamar?"
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </label>
              )}
              <label className={formLabelClasses}>
                E-mail
                <input
                  name="email"
                  className={`${formFieldClasses} min-h-11 text-[14px]`}
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  required
                />
              </label>
              <label className={formLabelClasses}>
                Senha
                <input
                  name="password"
                  className={`${formFieldClasses} min-h-11 text-[14px]`}
                  type="password"
                  autoComplete={register ? "new-password" : "current-password"}
                  placeholder="Mínimo de 8 caracteres"
                  minLength={8}
                  required
                />
              </label>
              {register && (
                <label className={formLabelClasses}>
                  Confirme sua senha
                  <input
                    name="confirmation"
                    className={`${formFieldClasses} min-h-11 text-[14px]`}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Digite sua senha novamente"
                    minLength={8}
                    required
                  />
                </label>
              )}
              <button
                className={`${buttonBaseClasses} ${buttonDarkClasses} mt-[3px] w-full text-sm`}
                type="submit"
                disabled={busy}
              >
                {busy
                  ? "Aguarde..."
                  : register
                    ? "Criar minha conta"
                    : "Entrar"}{" "}
                <ArrowRight size={17} />
              </button>
            </form>
            <p className="my-5 text-center text-xs text-[#7d8a84] dark:text-[#a5b5ac]">
              {register ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
              <Link
                className="ml-1 font-bold text-teal"
                to={register ? "/login" : "/register"}
              >
                {register ? "Entrar" : "Criar conta"}
              </Link>
            </p>
            <div className="flex items-center justify-center gap-[7px] text-[12px] text-[#9aa69f] dark:text-[#a5b5ac]">
              <LockKeyhole size={14} /> Seus dados são criptografados e nunca
              compartilhados.
            </div>
          </div>
        </div>
      </main>
      {error && (
        <AlertDialog
          title="Confira os dados"
          description={error}
          onClose={() => setError("")}
        />
      )}
    </>
  );
}

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";
import type { ThemeMode } from "../types";
import { buttonBaseClasses, buttonDarkClasses } from "../utils/tailwind";

export default function HomePage({
  theme,
  onToggleTheme,
}: {
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  return (
    <main className="overflow-hidden bg-canvas dark:bg-dark-canvas">
      <nav className="mx-auto flex h-[84px] w-[calc(100%-64px)] max-w-[1180px] items-center justify-between border-b border-[#e6ebe3] dark:border-dark-border max-[820px]:h-[72px] max-[820px]:w-[calc(100%-40px)] max-[820px]:max-w-[650px] max-[600px]:h-[65px] max-[600px]:w-[calc(100%-32px)]">
        <Brand />
        <div className="ml-[75px] flex gap-[35px] text-xs text-[#66736e] [&_a:hover]:text-teal max-[1080px]:ml-[15px] max-[820px]:hidden">
          <a href="#como-funciona">Como funciona</a>
          <a href="#beneficios">Benefícios</a>
        </div>
        <div className="flex items-center gap-[22px] max-[600px]:gap-[13px]">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <Link
            className="text-xs font-semibold text-[#31443e] hover:text-teal dark:text-[#e2ece5] max-[600px]:text-[12px]"
            to="/login"
          >
            Entrar
          </Link>
          <Link
            className={`${buttonBaseClasses} ${buttonDarkClasses} min-h-[42px] px-4 text-xs max-[600px]:min-h-[37px] max-[600px]:px-[11px] max-[600px]:text-[10px]`}
            to="/register"
          >
            Criar conta <ArrowRight size={16} />
          </Link>
        </div>
      </nav>
      <section className="relative mx-auto grid min-h-[565px] w-[calc(100%-64px)] max-w-[1180px] grid-cols-[0.91fr_1.09fr] items-center gap-10 pb-12 pt-10 max-[820px]:w-[calc(100%-40px)] max-[820px]:max-w-[650px] max-[820px]:grid-cols-1 max-[820px]:gap-[5px] max-[820px]:pt-[58px] max-[600px]:w-[calc(100%-32px)] max-[600px]:pt-[46px]">
        <div className="relative z-[1] pb-[10px] max-[820px]:text-center">
          <div className="inline-flex items-center gap-[9px] text-[12px] font-bold tracking-[1.5px] text-teal max-[820px]:justify-center">
            <span className="size-[7px] rounded-full bg-coral shadow-[0_0_0_4px_#f26a3d19]" />{" "}
            MAIS CLAREZA, MENOS PREOCUPAÇÃO
          </div>
          <h1 className="my-[23px] mb-[15px] font-display text-[clamp(45px,5.2vw,65px)] font-semibold leading-[1.08] tracking-[-3.4px] text-forest dark:text-[#e5eee8] max-[820px]:my-[19px] max-[600px]:mt-[19px] max-[600px]:text-[clamp(43px,13vw,57px)] max-[600px]:tracking-[-2.7px]">
            Seu dinheiro,
            <br />
            no{" "}
            <span className="text-teal dark:text-[#69c5b0]">ritmo certo.</span>
          </h1>
          <p className="m-0 max-w-[440px] text-sm leading-[1.85] text-[#66736e] dark:text-[#a5b5ac] max-[820px]:mx-auto max-[600px]:max-w-[350px] max-[600px]:text-xs">
            Contas organizadas, vencimentos sob controle e uma visão clara das
            suas finanças. Tudo em um só lugar, do seu jeito.
          </p>
          <div className="mt-7 flex items-center gap-6 max-[820px]:justify-center max-[600px]:mt-[23px] max-[600px]:flex-col max-[600px]:gap-4">
            <Link
              className={`${buttonBaseClasses} min-h-[49px] px-[19px] text-xs text-white bg-coral shadow-[0_8px_18px_#f26a3d2c] hover:bg-[#dc5932] max-[600px]:min-h-12`}
              to="/register"
            >
              Comece gratuitamente <ArrowRight size={17} />
            </Link>
            <Link
              className="inline-flex items-center gap-[6px] text-[12px] font-semibold text-[#38514a] hover:text-teal dark:text-[#e2ece5]"
              to="/login"
            >
              Já tenho uma conta <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="mt-7 flex items-center gap-[10px] text-[12px] text-[#84908a] dark:text-[#a5b5ac] max-[820px]:justify-center max-[600px]:mt-[21px]">
            <div className="flex">
              <span className="ml-[-4px] grid size-[25px] place-items-center rounded-full border-2 border-canvas bg-[#e2eee8] text-teal first:ml-0 dark:border-dark-canvas">
                <ShieldCheck size={16} />
              </span>
              <span className="ml-[-4px] grid size-[25px] place-items-center rounded-full border-2 border-canvas bg-[#e2eee8] text-teal first:ml-0 dark:border-dark-canvas">
                <LockKeyhole size={15} />
              </span>
            </div>
            <span>Seus dados são só seus. Sempre.</span>
          </div>
        </div>
        <div
          className="relative grid min-h-[440px] place-items-center max-[820px]:min-h-[430px] max-[600px]:mt-[5px] max-[600px]:min-h-[370px]"
          aria-label="Prévia do painel financeiro"
        >
          <div className="absolute size-[420px] rounded-full border border-[#dfe7df] dark:border-[#293a31] max-[600px]:size-[340px]" />
          <div className="absolute size-[350px] rounded-full border border-[#dfe7df] dark:border-[#293a31] max-[600px]:size-[285px]" />
          <div className="absolute right-[33px] top-6 size-16 rotate-[20deg] rounded-[20px] bg-[#efc87d55]" />
          <div className="relative z-[1] w-[91%] max-w-[440px] rounded-[17px] border border-[#e9eee7] bg-white px-[25px] pb-[17px] pt-6 shadow-[0_24px_65px_#183d3020,0_3px_8px_#183d3008] dark:border-dark-border dark:bg-dark-surface max-[600px]:w-[94%] max-[600px]:px-[17px] max-[600px]:pb-[13px] max-[600px]:pt-[18px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[1.2px] text-[#9aa59f] dark:text-[#9eafa5]">
                VISÃO GERAL
              </span>
              <span className="inline-flex items-center gap-[5px] text-[10px] text-[#74817b] dark:text-[#b6c7bd]">
                Este mês <ChevronDown size={13} />
              </span>
            </div>
            <p className="mb-[3px] mt-5 text-[12px] text-[#65726c] dark:text-[#a5b5ac]">
              Contas do mês
            </p>
            <div className="font-display text-[32px] font-semibold tracking-[-1.2px] text-ink dark:text-[#e8f0ea]">
              R$ 4.280
              <span className="text-lg text-[#586760] dark:text-[#b7c8be]">
                ,00
              </span>
            </div>
            <div className="mt-[6px] flex items-center gap-[5px] text-[10px] text-[#96a09b] dark:text-[#9eafa5]">
              <span className="inline-flex items-center gap-0.5 font-semibold text-teal">
                <ArrowDownRight size={13} /> 8,4%
              </span>{" "}
              vs. mês passado
            </div>
            <div className="mt-[13px] h-[105px] max-[600px]:h-[91px]">
              <svg
                className="h-[82px] w-full overflow-visible max-[600px]:h-[70px]"
                viewBox="0 0 420 110"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0A7C78" stopOpacity=".22" />
                    <stop offset="100%" stopColor="#0A7C78" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 83 C35 79 42 57 77 63 S117 79 147 50 S192 61 218 40 S270 55 297 29 S343 49 367 25 S399 28 420 9 V110 H0Z"
                  fill="url(#fill)"
                />
                <path
                  d="M0 83 C35 79 42 57 77 63 S117 79 147 50 S192 61 218 40 S270 55 297 29 S343 49 367 25 S399 28 420 9"
                  fill="none"
                  stroke="#0A7C78"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-[#a4ada8]">
                <span>01</span>
                <span>07</span>
                <span>14</span>
                <span>21</span>
                <span>30</span>
              </div>
            </div>
            <div className="border-t border-[#eef0ec] pt-[11px] dark:border-[#2b3d34]">
              <div className="flex items-center gap-[10px] py-[9px]">
                <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-[#fff4d8] text-[#c68e2d]">
                  <Zap size={14} />
                </span>
                <span className="flex-1 text-[12px] font-semibold text-[#34473f] dark:text-[#e2ece5]">
                  Energia elétrica
                  <small className="mt-[3px] block text-[10px] font-normal text-[#99a39e] dark:text-[#9eafa5]">
                    Casa · vence dia 18
                  </small>
                </span>
                <b className="text-[12px] text-[#31443e] dark:text-[#e2ece5]">
                  R$ 186,40
                </b>
              </div>
              <div className="flex items-center gap-[10px] py-[9px]">
                <span className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-[#e4f2ee] text-teal">
                  <FileText size={14} />
                </span>
                <span className="flex-1 text-[12px] font-semibold text-[#34473f] dark:text-[#e2ece5]">
                  Internet
                  <small className="mt-[3px] block text-[10px] font-normal text-[#99a39e] dark:text-[#9eafa5]">
                    Casa · vence dia 22
                  </small>
                </span>
                <b className="text-[12px] text-[#31443e] dark:text-[#e2ece5]">
                  R$ 119,90
                </b>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[63px] right-[-3px] z-[2] flex items-center gap-[9px] rounded-xl border border-[#edf0ea] bg-white px-[15px] py-[10px] pl-[10px] shadow-[0_12px_30px_#183d3019] dark:border-dark-border dark:bg-dark-surface max-[600px]:bottom-[45px] max-[600px]:right-[-1px]">
            <span className="grid size-7 place-items-center rounded-[9px] bg-[#e4f2ee] text-teal dark:bg-[#20372d]">
              <Check size={15} />
            </span>
            <div>
              <b className="block text-[10px] text-[#28443a] dark:text-[#e2ece5]">
                Tudo em dia!
              </b>
              <small className="mt-[3px] block text-[10px] text-[#93a099] dark:text-[#9eafa5]">
                Você está no controle
              </small>
            </div>
          </div>
          <div className="absolute bottom-[15px] left-1/2 w-max -translate-x-1/2 text-[10px] font-semibold tracking-[1.25px] text-[#a2ada5] max-[600px]:bottom-[9px] max-[600px]:text-[9px]">
            FINANÇAS MAIS LEVES, TODOS OS DIAS{" "}
            <span className="pl-1 text-coral">✳</span>
          </div>
        </div>
      </section>
      <section
        id="beneficios"
        className="mx-auto grid w-[calc(100%-64px)] max-w-[1180px] grid-cols-[1.15fr_repeat(3,1fr)] gap-5 border-t border-[#e4e9e1] pb-16 pt-[45px] max-[820px]:w-[calc(100%-40px)] max-[820px]:max-w-[650px] max-[820px]:grid-cols-2 max-[820px]:gap-[25px_15px] max-[820px]:py-[36px] max-[820px]:pb-[45px] max-[600px]:w-[calc(100%-32px)] max-[600px]:gap-[23px_7px]"
      >
        <div className="max-[820px]:pl-[14px] max-[600px]:pl-[7px]">
          <span className="text-[12px] font-bold tracking-[1.5px] text-teal">
            SEU DIA A DIA, SIMPLIFICADO
          </span>
          <h2 className="mt-[10px] font-display text-[27px] font-semibold leading-[1.25] tracking-[-0.8px] text-forest dark:text-[#e5eee8] max-[600px]:text-[24px]">
            Organização que
            <br />
            faz bem.
          </h2>
        </div>
        <div className="min-h-[152px] px-[14px] py-[3px] max-[820px]:px-[14px] max-[600px]:px-2">
          <span className="grid size-[37px] place-items-center rounded-[11px] bg-[#e3efea] text-teal">
            <CalendarDays size={20} />
          </span>
          <h3 className="mb-[7px] mt-[15px] text-xs font-semibold text-[#183d34] dark:text-[#e2ece5] max-[600px]:text-[12px]">
            Nada passa do prazo
          </h3>
          <p className="m-0 max-w-[205px] text-[12px] leading-[1.75] text-[#78847e] dark:text-[#a5b5ac] max-[600px]:text-[10px]">
            Veja o que vence e o que já venceu antes que vire preocupação.
          </p>
        </div>
        <div className="min-h-[152px] px-[14px] py-[3px] max-[820px]:px-[14px] max-[600px]:px-2">
          <span className="grid size-[37px] place-items-center rounded-[11px] bg-[#fff0e8] text-coral">
            <TrendingUp size={20} />
          </span>
          <h3 className="mb-[7px] mt-[15px] text-xs font-semibold text-[#183d34] dark:text-[#e2ece5] max-[600px]:text-[12px]">
            Entenda seus gastos
          </h3>
          <p className="m-0 max-w-[205px] text-[12px] leading-[1.75] text-[#78847e] dark:text-[#a5b5ac] max-[600px]:text-[10px]">
            Um resumo visual para saber exatamente para onde seu dinheiro vai.
          </p>
        </div>
        <div className="min-h-[152px] px-[14px] py-[3px] max-[820px]:px-[14px] max-[600px]:px-2">
          <span className="grid size-[37px] place-items-center rounded-[11px] bg-[#e3efea] text-teal">
            <LockKeyhole size={20} />
          </span>
          <h3 className="mb-[7px] mt-[15px] text-xs font-semibold text-[#183d34] dark:text-[#e2ece5] max-[600px]:text-[12px]">
            Privacidade em primeiro
          </h3>
          <p className="m-0 max-w-[205px] text-[12px] leading-[1.75] text-[#78847e] dark:text-[#a5b5ac] max-[600px]:text-[10px]">
            Seu espaço é individual e seus dados são protegidos.
          </p>
        </div>
      </section>
      <section
        id="como-funciona"
        className="mx-auto flex min-h-[262px] w-[calc(100%-64px)] max-w-[1180px] flex-col items-center justify-center rounded-[20px] bg-forest text-center text-white max-[820px]:w-[calc(100%-40px)] max-[820px]:max-w-[650px] max-[600px]:w-[calc(100%-32px)] max-[600px]:min-h-[238px] max-[600px]:px-4"
      >
        <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[1.3px] text-[#acd0c1]">
          <Sparkles size={18} />
          <span>UM PASSO DE CADA VEZ</span>
        </div>
        <h2 className="my-[14px] mb-[18px] font-display text-[28px] font-medium leading-[1.25] tracking-[-0.8px] max-[600px]:text-[24px]">
          Uma vida financeira
          <br />
          mais tranquila começa aqui.
        </h2>
        <Link
          className={`${buttonBaseClasses} min-h-[42px] px-4 text-[12px] text-forest bg-white`}
          to="/register"
        >
          Criar minha conta <ArrowRight size={17} />
        </Link>
        <p className="mt-[10px] text-[10px] text-[#96b5aa]">
          Gratuito para começar. Sem complicação.
        </p>
      </section>
      <footer className="mx-auto flex min-h-[86px] w-[calc(100%-64px)] max-w-[1180px] items-center justify-between text-[10px] text-[#8b9690] max-[820px]:w-[calc(100%-40px)] max-[820px]:max-w-[650px] max-[600px]:w-[calc(100%-32px)] max-[600px]:flex-wrap max-[600px]:gap-[5px] max-[600px]:py-[17px]">
        <Brand />
        <span className="text-[10px] max-[600px]:order-2 max-[600px]:w-full">
          © 2025 Monevo. Feito para deixar a vida mais leve.
        </span>
        <span className="max-[600px]:text-[10px]">
          Privacidade e cuidado, sempre.
        </span>
      </footer>
    </main>
  );
}

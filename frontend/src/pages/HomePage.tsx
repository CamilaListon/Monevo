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

export default function HomePage({
  theme,
  onToggleTheme,
}: {
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  return (
    <main className="landing">
      <nav className="landing-nav page-width">
        <Brand />
        <div className="landing-nav-links">
          <a href="#como-funciona">Como funciona</a>
          <a href="#beneficios">Benefícios</a>
        </div>
        <div className="nav-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <Link className="login-link" to="/login">
            Entrar
          </Link>
          <Link className="button button-dark button-small" to="/register">
            Criar conta <ArrowRight size={16} />
          </Link>
        </div>
      </nav>
      <section className="hero page-width">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> MAIS CLAREZA, MENOS PREOCUPAÇÃO
          </div>
          <h1>
            Seu dinheiro,
            <br />
            no <span>ritmo certo.</span>
          </h1>
          <p>
            Contas organizadas, vencimentos sob controle e uma visão clara das
            suas finanças. Tudo em um só lugar, do seu jeito.
          </p>
          <div className="hero-actions">
            <Link className="button button-coral" to="/register">
              Comece gratuitamente <ArrowRight size={17} />
            </Link>
            <Link className="text-link" to="/login">
              Já tenho uma conta <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="trust-row">
            <div className="trust-icons">
              <span>
                <ShieldCheck size={16} />
              </span>
              <span>
                <LockKeyhole size={15} />
              </span>
            </div>
            <span>Seus dados são só seus. Sempre.</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Prévia do painel financeiro">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="preview-card">
            <div className="preview-header">
              <span className="preview-label">VISÃO GERAL</span>
              <span className="preview-month">
                Este mês <ChevronDown size={13} />
              </span>
            </div>
            <p className="preview-title">Contas do mês</p>
            <div className="preview-total">
              R$ 4.280<span>,00</span>
            </div>
            <div className="preview-delta">
              <span>
                <ArrowDownRight size={13} /> 8,4%
              </span>{" "}
              vs. mês passado
            </div>
            <div className="preview-chart">
              <svg
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
              <div className="chart-months">
                <span>01</span>
                <span>07</span>
                <span>14</span>
                <span>21</span>
                <span>30</span>
              </div>
            </div>
            <div className="preview-bills">
              <div>
                <span className="bill-icon home-icon">
                  <Zap size={14} />
                </span>
                <span className="preview-bill-name">
                  Energia elétrica<small>Casa · vence dia 18</small>
                </span>
                <b>R$ 186,40</b>
              </div>
              <div>
                <span className="bill-icon internet-icon">
                  <FileText size={14} />
                </span>
                <span className="preview-bill-name">
                  Internet<small>Casa · vence dia 22</small>
                </span>
                <b>R$ 119,90</b>
              </div>
            </div>
          </div>
          <div className="floating-badge">
            <span>
              <Check size={15} />
            </span>
            <div>
              <b>Tudo em dia!</b>
              <small>Você está no controle</small>
            </div>
          </div>
          <div className="visual-caption">
            FINANÇAS MAIS LEVES, TODOS OS DIAS <span>✳</span>
          </div>
        </div>
      </section>
      <section id="beneficios" className="benefits page-width">
        <div className="benefit-intro">
          <span className="eyebrow">SEU DIA A DIA, SIMPLIFICADO</span>
          <h2>
            Organização que
            <br />
            faz bem.
          </h2>
        </div>
        <div className="benefit-card">
          <span className="benefit-icon">
            <CalendarDays size={20} />
          </span>
          <h3>Nada passa do prazo</h3>
          <p>Veja o que vence e o que já venceu antes que vire preocupação.</p>
        </div>
        <div className="benefit-card">
          <span className="benefit-icon coral-icon">
            <TrendingUp size={20} />
          </span>
          <h3>Entenda seus gastos</h3>
          <p>
            Um resumo visual para saber exatamente para onde seu dinheiro vai.
          </p>
        </div>
        <div className="benefit-card">
          <span className="benefit-icon">
            <LockKeyhole size={20} />
          </span>
          <h3>Privacidade em primeiro</h3>
          <p>Seu espaço é individual e seus dados são protegidos.</p>
        </div>
      </section>
      <section id="como-funciona" className="landing-cta page-width">
        <div>
          <Sparkles size={18} />
          <span>UM PASSO DE CADA VEZ</span>
        </div>
        <h2>
          Uma vida financeira
          <br />
          mais tranquila começa aqui.
        </h2>
        <Link className="button button-light" to="/register">
          Criar minha conta <ArrowRight size={17} />
        </Link>
        <p>Gratuito para começar. Sem complicação.</p>
      </section>
      <footer className="landing-footer page-width">
        <Brand />
        <span>© 2025 Monevo. Feito para deixar a vida mais leve.</span>
        <span>Privacidade e cuidado, sempre.</span>
      </footer>
    </main>
  );
}

import { lazy, Suspense, useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ArrowUpRightFromSquare,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileText,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api, apiUrl } from "./api";
import type { Bill, BillInput, DashboardData, StatusFilter, User } from "./types";

const DashboardCharts = lazy(() => import("./DashboardCharts"));
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
type ThemeMode = "light" | "dark";

function currentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-");
  return `${monthNames[Number(month) - 1]} ${year}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(`${value.slice(0, 10)}T12:00:00`))
    .replace(".", "");
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>(() =>
    localStorage.getItem("monevo-theme") === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("monevo-theme", theme);
  }, [theme]);

  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) return <div className="screen-loader"><span className="loader" /></div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" onAuthenticated={setUser} theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" onAuthenticated={setUser} theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />} />
      <Route path="/dashboard" element={user ? <Dashboard user={user} theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} onLogout={() => setUser(null)} /> : <Navigate to="/login" replace />} />
      <Route path="/account" element={user ? <AccountPage user={user} onUserUpdated={setUser} theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} onLogout={() => setUser(null)} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ThemeToggle({ theme, onToggle, compact = false }: { theme: ThemeMode; onToggle: () => void; compact?: boolean }) {
  const label = theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";
  return (
    <button className={`theme-toggle ${compact ? "theme-toggle-compact" : ""}`} onClick={onToggle} aria-label={label} title={label}>
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      {!compact && <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>}
    </button>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark"><Wallet size={19} strokeWidth={2.2} /></span>
      <span>monevo<span className="brand-dot">.</span></span>
    </Link>
  );
}

function HomePage({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  return (
    <main className="landing">
      <nav className="landing-nav page-width">
        <Brand />
        <div className="landing-nav-links"><a href="#como-funciona">Como funciona</a><a href="#beneficios">Benefícios</a></div>
        <div className="nav-actions"><ThemeToggle theme={theme} onToggle={onToggleTheme} /><Link className="login-link" to="/login">Entrar</Link><Link className="button button-dark button-small" to="/register">Criar conta <ArrowRight size={16} /></Link></div>
      </nav>
      <section className="hero page-width">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> MAIS CLAREZA, MENOS PREOCUPAÇÃO</div>
          <h1>Seu dinheiro,<br />no <span>ritmo certo.</span></h1>
          <p>Contas organizadas, vencimentos sob controle e uma visão clara das suas finanças. Tudo em um só lugar, do seu jeito.</p>
          <div className="hero-actions"><Link className="button button-coral" to="/register">Comece gratuitamente <ArrowRight size={17} /></Link><Link className="text-link" to="/login">Já tenho uma conta <ArrowUpRight size={16} /></Link></div>
          <div className="trust-row"><div className="trust-icons"><span><ShieldCheck size={16} /></span><span><LockKeyhole size={15} /></span></div><span>Seus dados são só seus. Sempre.</span></div>
        </div>
        <div className="hero-visual" aria-label="Prévia do painel financeiro">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="preview-card">
            <div className="preview-header"><span className="preview-label">VISÃO GERAL</span><span className="preview-month">Este mês <ChevronDown size={13} /></span></div>
            <p className="preview-title">Contas do mês</p><div className="preview-total">R$ 4.280<span>,00</span></div>
            <div className="preview-delta"><span><ArrowDownRight size={13} /> 8,4%</span> vs. mês passado</div>
            <div className="preview-chart"><svg viewBox="0 0 420 110" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0A7C78" stopOpacity=".22" /><stop offset="100%" stopColor="#0A7C78" stopOpacity="0" /></linearGradient></defs><path d="M0 83 C35 79 42 57 77 63 S117 79 147 50 S192 61 218 40 S270 55 297 29 S343 49 367 25 S399 28 420 9 V110 H0Z" fill="url(#fill)" /><path d="M0 83 C35 79 42 57 77 63 S117 79 147 50 S192 61 218 40 S270 55 297 29 S343 49 367 25 S399 28 420 9" fill="none" stroke="#0A7C78" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-months"><span>01</span><span>07</span><span>14</span><span>21</span><span>30</span></div></div>
            <div className="preview-bills"><div><span className="bill-icon home-icon"><Zap size={14} /></span><span className="preview-bill-name">Energia elétrica<small>Casa · vence dia 18</small></span><b>R$ 186,40</b></div><div><span className="bill-icon internet-icon"><FileText size={14} /></span><span className="preview-bill-name">Internet<small>Casa · vence dia 22</small></span><b>R$ 119,90</b></div></div>
          </div>
          <div className="floating-badge"><span><Check size={15} /></span><div><b>Tudo em dia!</b><small>Você está no controle</small></div></div>
          <div className="visual-caption">FINANÇAS MAIS LEVES, TODOS OS DIAS <span>✳</span></div>
        </div>
      </section>
      <section id="beneficios" className="benefits page-width">
        <div className="benefit-intro"><span className="eyebrow">SEU DIA A DIA, SIMPLIFICADO</span><h2>Organização que<br />faz bem.</h2></div>
        <div className="benefit-card"><span className="benefit-icon"><CalendarDays size={20} /></span><h3>Nada passa do prazo</h3><p>Veja o que vence e o que já venceu antes que vire preocupação.</p></div>
        <div className="benefit-card"><span className="benefit-icon coral-icon"><TrendingUp size={20} /></span><h3>Entenda seus gastos</h3><p>Um resumo visual para saber exatamente para onde seu dinheiro vai.</p></div>
        <div className="benefit-card"><span className="benefit-icon"><LockKeyhole size={20} /></span><h3>Privacidade em primeiro</h3><p>Seu espaço é individual e seus dados são protegidos.</p></div>
      </section>
      <section id="como-funciona" className="landing-cta page-width"><div><Sparkles size={18} /><span>UM PASSO DE CADA VEZ</span></div><h2>Uma vida financeira<br />mais tranquila começa aqui.</h2><Link className="button button-light" to="/register">Criar minha conta <ArrowRight size={17} /></Link><p>Gratuito para começar. Sem complicação.</p></section>
      <footer className="landing-footer page-width"><Brand /><span>© 2025 Monevo. Feito para deixar a vida mais leve.</span><span>Privacidade e cuidado, sempre.</span></footer>
    </main>
  );
}

function AuthPage({ mode, onAuthenticated, theme, onToggleTheme }: { mode: "login" | "register"; onAuthenticated: (user: User) => void; theme: ThemeMode; onToggleTheme: () => void }) {
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
      const { user } = await api<{ user: User }>(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(register ? { name, email, password } : { email, password }),
      });
      onAuthenticated(user);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art"><Brand light /><div className="auth-art-content"><span className="eyebrow">UM NOVO JEITO DE CUIDAR</span><h1>Mais leveza<br />para sua vida<br /><em>financeira.</em></h1><p>Organize suas contas e aproveite a tranquilidade de saber que está tudo sob controle.</p><div className="auth-art-footer"><ShieldCheck size={17} /> Seus dados protegidos e privados</div></div><div className="auth-orb" /></div>
      <div className="auth-form-side"><div className="auth-top-actions"><ThemeToggle theme={theme} onToggle={onToggleTheme} compact /><Link className="auth-back" to="/">← Voltar ao início</Link></div><div className="auth-form-wrap"><span className="eyebrow">{register ? "VAMOS COMEÇAR" : "QUE BOM TER VOCÊ DE VOLTA"}</span><h2>{register ? "Crie sua conta" : "Boas-vindas de volta"}</h2><p className="auth-subtitle">{register ? "É rapidinho. E o primeiro passo para uma vida mais leve." : "Entre para continuar cuidando bem do seu dinheiro."}</p>
        <form className="auth-form" onSubmit={submit}>
          {register && <label>Seu nome<input name="name" autoComplete="name" placeholder="Como podemos te chamar?" required minLength={2} maxLength={80} /></label>}
          <label>E-mail<input name="email" type="email" autoComplete="email" placeholder="voce@email.com" required /></label>
          <label>Senha<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} placeholder="Mínimo de 8 caracteres" minLength={8} required /></label>
          {register && <label>Confirme sua senha<input name="confirmation" type="password" autoComplete="new-password" placeholder="Digite sua senha novamente" minLength={8} required /></label>}
          {error && <div role="alert" className="form-error">{error}</div>}
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? "Aguarde..." : register ? "Criar minha conta" : "Entrar"} <ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">{register ? "Já tem uma conta?" : "Ainda não tem uma conta?"} <Link to={register ? "/login" : "/register"}>{register ? "Entrar" : "Criar conta"}</Link></p>
        <div className="auth-privacy"><LockKeyhole size={14} /> Seus dados são criptografados e nunca compartilhados.</div>
      </div></div>
    </main>
  );
}

function Dashboard({ user, theme, onToggleTheme, onLogout }: { user: User; theme: ThemeMode; onToggleTheme: () => void; onLogout: () => void }) {
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<Bill | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("Visão geral");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const result = await api<DashboardData>(`/dashboard?month=${month}-01`);
      setData(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o painel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadDashboard(); }, [month]);

  async function logout() {
    try {
      await api<void>("/auth/logout", { method: "POST" });
      onLogout();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível encerrar a sessão.");
    }
  }

  async function togglePayment(bill: Bill) {
    try {
      await api<Bill>(`/bills/${bill.id}/payment`, {
        method: "PATCH",
        body: JSON.stringify({ paid: bill.status !== "paid" }),
      });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o pagamento.");
    }
  }

  async function deleteBill(bill: Bill) {
    if (!window.confirm(`Excluir "${bill.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api<void>(`/bills/${bill.id}`, { method: "DELETE" });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir a conta.");
    }
  }

  const bills = (data?.bills ?? []).filter((bill) => {
    const matchesStatus = status === "all" || bill.status === status;
    const matchesCategory = category === "all" || bill.category === category;
    const matchesSearch = `${bill.title} ${bill.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });
  const categories = [...new Set((data?.bills ?? []).map((bill) => bill.category))];
  const paidCount = data?.bills.filter((bill) => bill.status === "paid").length ?? 0;
  const paidPercentage = data?.bills.length ? Math.round((paidCount / data.bills.length) * 100) : 0;

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><Brand /></div>
        <div className="sidebar-label">MENU</div>
        <nav className="side-nav">
          <button className={`side-link ${activeNav === "Visão geral" ? "side-active" : ""}`} onClick={() => setActiveNav("Visão geral")}><LayoutDashboard size={18} /> Visão geral</button>
          <button className={`side-link ${activeNav === "Minhas contas" ? "side-active" : ""}`} onClick={() => { setActiveNav("Minhas contas"); document.getElementById("bills-section")?.scrollIntoView({ behavior: "smooth" }); }}><CreditCard size={18} /> Minhas contas</button>
          <button className={`side-link ${activeNav === "Pagamentos" ? "side-active" : ""}`} onClick={() => { setActiveNav("Pagamentos"); document.getElementById("payments-section")?.scrollIntoView({ behavior: "smooth" }); }}><CheckCircle2 size={18} /> Pagamentos</button>
          <Link className="side-link" to="/account"><UserRound size={18} /> Minha conta</Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span><CircleHelp size={17} /></span><b>Precisa de ajuda?</b><p>Estamos aqui para você.</p><a href="mailto:ajuda@monevo.app">Fale com a gente <ArrowUpRightFromSquare size={13} /></a></div>
          <button className="side-link logout-link" onClick={() => void logout()}><LogOut size={18} /> Sair da conta</button>
        </div>
      </aside>
      {mobileMenu && <button className="mobile-backdrop" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
      <main className="dashboard-main">
        <header className="dash-topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menu"><Menu size={21} /></button>
          <div className="breadcrumb">Seu espaço <span>/</span> <b>Visão geral</b></div>
          <div className="topbar-right"><ThemeToggle theme={theme} onToggle={onToggleTheme} compact /><button className="month-pill" onClick={() => document.getElementById("month-picker")?.focus()}><CalendarDays size={16} /><span>{monthLabel(month)}</span><ChevronDown size={14} /><input id="month-picker" type="month" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Selecionar mês" /></button><div className="topbar-divider" /><Link className="user-profile-link" to="/account" aria-label="Abrir minha conta"><div className="user-avatar">{user.avatarUrl ? <img src={apiUrl(user.avatarUrl)} crossOrigin="use-credentials" alt="" /> : user.name.charAt(0).toUpperCase()}</div><div className="user-meta"><b>{user.name.split(" ")[0]}</b><span>Minha conta</span></div></Link></div>
        </header>
        <div className="dashboard-content">
          <div className="welcome-row"><div><div className="welcome-date">{new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</div><h1>Bom dia, {user.name.split(" ")[0]} <span className="wave">✳</span></h1><p>Aqui está o resumo das suas contas.</p></div><button className="button button-dark add-button" onClick={() => setDialog("new")}><Plus size={18} /> Nova conta</button></div>
          {error && <div role="alert" className="dashboard-error">{error}<button onClick={() => setError("")}><X size={15} /></button></div>}
          <section className="summary-grid" aria-label="Resumo mensal">
            <SummaryCard title="Total de contas" value={data?.summary.total ?? 0} icon={<Wallet size={18} />} tone="green" footer={`${data?.bills.length ?? 0} contas neste mês`} />
            <SummaryCard title="Já pagas" value={data?.summary.paid ?? 0} icon={<CheckCircle2 size={18} />} tone="teal" footer={`${paidPercentage}% das contas do mês`} />
            <SummaryCard title="A vencer" value={data?.summary.pending ?? 0} icon={<CalendarDays size={18} />} tone="orange" footer="Contas ainda não pagas" />
            <SummaryCard title="Atrasadas" value={data?.summary.overdue ?? 0} icon={<ArrowUpRight size={18} />} tone="red" footer="Precisam da sua atenção" />
          </section>
          <Suspense fallback={<div className="insights-grid"><div className="panel chart-loading">Carregando gráficos...</div><div className="panel chart-loading">Carregando gráficos...</div></div>}>
            <DashboardCharts data={data} month={monthLabel(month)} loading={loading} onSelectMonth={() => document.getElementById("month-picker")?.focus()} />
          </Suspense>
          <section className="panel bills-panel" id="bills-section">
            <div className="panel-heading bills-heading"><div><span className="panel-kicker">ACOMPANHE DE PERTO</span><h2>Suas contas <span className="count-badge">{data?.bills.length ?? 0}</span></h2></div><div className="table-actions"><label className="search-field"><Search size={16} /><input placeholder="Buscar conta..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><select className="filter-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoria"><option value="all">Todas categorias</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div></div>
            <div className="quick-filters"><span>Mostrar:</span>{([["all", "Todas"], ["pending", "Pendentes"], ["overdue", "Atrasadas"], ["paid", "Pagas"]] as [StatusFilter, string][]).map(([value, label]) => <button key={value} onClick={() => setStatus(value)} className={`filter-chip ${status === value ? "filter-chip-active" : ""}`}>{label}{value === "overdue" && (data?.bills.filter((bill) => bill.status === "overdue").length ?? 0) > 0 && <span className="filter-count">{data?.bills.filter((bill) => bill.status === "overdue").length}</span>}</button>)}</div>
            {loading ? <div className="empty-state"><span className="loader" /><p>Carregando suas contas...</p></div> : bills.length === 0 ? <div className="empty-state"><span className="empty-icon"><FileText size={22} /></span><b>{data?.bills.length ? "Nenhuma conta com esses filtros" : "Tudo começa com uma conta"}</b><p>{data?.bills.length ? "Tente mudar os filtros ou o período." : "Cadastre sua primeira conta e acompanhe tudo por aqui."}</p>{!data?.bills.length && <button className="button button-dark button-small" onClick={() => setDialog("new")}><Plus size={16} /> Adicionar conta</button>}</div> :
              <div className="table-wrap"><table><thead><tr><th>CONTA</th><th>CATEGORIA</th><th>VENCIMENTO</th><th>VALOR</th><th>SITUAÇÃO</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{bills.map((bill) => <tr key={bill.id}><td><div className="bill-title-cell"><span className={`bill-category-icon ${bill.status}`}><FileText size={16} /></span><div><b>{bill.title}</b><small>{bill.notes || bill.category}</small></div></div></td><td><span className="category-label">{bill.category}</span></td><td><span className={bill.status === "overdue" ? "due-overdue" : ""}>{formatDate(bill.dueDate)}</span></td><td className="amount-cell">{money.format(bill.amount)}</td><td><StatusBadge status={bill.status} /></td><td><div className="row-actions"><button title={bill.status === "paid" ? "Marcar como pendente" : "Marcar como paga"} onClick={() => void togglePayment(bill)} className="row-action"><Check size={15} /></button><button title="Editar conta" onClick={() => setDialog(bill)} className="row-action"><Pencil size={15} /></button><button title="Excluir conta" onClick={() => void deleteBill(bill)} className="row-action action-delete"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
          </section>
          <section className="panel payments-panel" id="payments-section"><div className="panel-heading"><div><span className="panel-kicker">HISTÓRICO</span><h2>Pagamentos recentes</h2></div><button className="subtle-link" onClick={() => { setStatus("paid"); document.getElementById("bills-section")?.scrollIntoView({ behavior: "smooth" }); }}>Ver contas pagas <ArrowRight size={15} /></button></div>{data?.recentPayments.length ? <div className="payment-list">{data.recentPayments.map((bill) => <div className="payment-item" key={bill.id}><span className="payment-check"><Check size={15} /></span><div className="payment-name"><b>{bill.title}</b><small>{bill.category} · pago em {bill.paidAt ? formatDate(bill.paidAt) : formatDate(bill.dueDate)}</small></div><b className="payment-amount">{money.format(bill.amount)}</b><span className="payment-status">Pago</span></div>)}</div> : <p className="no-payments">Os pagamentos registrados neste mês aparecerão aqui.</p>}</section>
          <footer className="dashboard-footer"><span>© 2025 Monevo · Seu dinheiro, no ritmo certo.</span><span><ShieldCheck size={14} /> Seus dados são privados</span></footer>
        </div>
      </main>
      {dialog && <BillDialog value={dialog === "new" ? null : dialog} onClose={() => setDialog(null)} onSaved={async () => { setDialog(null); await loadDashboard(); }} />}
    </div>
  );
}

function AccountPage({
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
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar seu nome.");
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
      setError(requestError instanceof Error ? requestError.message : "Não foi possível alterar sua senha.");
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
      const { user: updatedUser } = await api<{ user: User }>("/profile/avatar", {
        method: "POST",
        body: formData,
      });
      onUserUpdated(updatedUser);
      setAvatarFile(null);
      setNotice("Sua foto de perfil foi atualizada.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível enviar a imagem.");
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
      setError(requestError instanceof Error ? requestError.message : "Não foi possível remover a imagem.");
    } finally {
      setBusy("");
    }
  }

  async function logout() {
    try {
      await api<void>("/auth/logout", { method: "POST" });
      onLogout();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível encerrar a sessão.");
    }
  }

  const avatarSrc = previewUrl ?? (user.avatarUrl ? apiUrl(user.avatarUrl) : null);

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><Brand /></div>
        <div className="sidebar-label">MENU</div>
        <nav className="side-nav">
          <Link className="side-link" to="/dashboard" onClick={() => setMobileMenu(false)}><LayoutDashboard size={18} /> Visão geral</Link>
          <Link className="side-link" to="/dashboard#bills-section" onClick={() => setMobileMenu(false)}><CreditCard size={18} /> Minhas contas</Link>
          <Link className="side-link" to="/dashboard#payments-section" onClick={() => setMobileMenu(false)}><CheckCircle2 size={18} /> Pagamentos</Link>
          <Link className="side-link side-active" to="/account" onClick={() => setMobileMenu(false)}><UserRound size={18} /> Minha conta</Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span><CircleHelp size={17} /></span><b>Precisa de ajuda?</b><p>Estamos aqui para você.</p><a href="mailto:ajuda@monevo.app">Fale com a gente <ArrowUpRightFromSquare size={13} /></a></div>
          <button className="side-link logout-link" onClick={() => void logout()}><LogOut size={18} /> Sair da conta</button>
        </div>
      </aside>
      {mobileMenu && <button className="mobile-backdrop" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
      <main className="dashboard-main">
        <header className="dash-topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menu"><Menu size={21} /></button>
          <div className="breadcrumb">Seu espaço <span>/</span> <b>Minha conta</b></div>
          <div className="topbar-right"><ThemeToggle theme={theme} onToggle={onToggleTheme} compact /><Link className="user-profile-link" to="/dashboard"><div className="user-avatar">{avatarSrc ? <img src={avatarSrc} crossOrigin="use-credentials" alt="" /> : user.name.charAt(0).toUpperCase()}</div><div className="user-meta"><b>{user.name.split(" ")[0]}</b><span>Voltar ao painel</span></div></Link></div>
        </header>
        <div className="dashboard-content account-content">
          <div className="welcome-row account-welcome"><div><div className="welcome-date">SEU PERFIL</div><h1>Minha conta</h1><p>Gerencie seus dados pessoais e sua segurança.</p></div></div>
          {error && <div role="alert" className="dashboard-error">{error}<button onClick={() => setError("")}><X size={15} /></button></div>}
          {notice && <div role="status" className="account-notice"><CheckCircle2 size={17} />{notice}<button onClick={() => setNotice("")} aria-label="Fechar aviso"><X size={15} /></button></div>}
          <div className="account-grid">
            <section className="panel account-panel">
              <div className="account-panel-heading"><span className="account-section-icon"><UserRound size={19} /></span><div><h2>Dados pessoais</h2><p>Seu perfil e como aparece no Monevo.</p></div></div>
              <div className="account-avatar-row">
                <div className="profile-avatar">{avatarSrc ? <img src={avatarSrc} crossOrigin="use-credentials" alt={`Foto de ${user.name}`} /> : <span>{user.name.charAt(0).toUpperCase()}</span>}</div>
                <div className="profile-avatar-details"><b>Foto de perfil</b><span>JPEG, PNG ou WebP. Até 5 MB.</span>
                  <div className="avatar-actions"><label className="button button-quiet avatar-select" htmlFor="avatar-file"><ImagePlus size={16} /> Escolher foto</label><input id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={selectAvatar} />{avatarFile && <button className="button button-dark avatar-save" type="button" onClick={() => void uploadAvatar()} disabled={busy === "avatar"}><Upload size={15} />{busy === "avatar" ? "Enviando..." : "Enviar foto"}</button>}{user.avatarUrl && <button className="avatar-remove" type="button" onClick={() => void removeAvatar()} disabled={busy === "avatar"}>Remover</button>}</div>
                </div>
              </div>
              <form className="account-form" onSubmit={saveName}>
                <label>Nome completo<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required autoComplete="name" /></label>
                <label>E-mail<input value={user.email} disabled readOnly autoComplete="email" /><small>O e-mail não pode ser alterado por aqui.</small></label>
                <button className="button button-dark account-save" type="submit" disabled={busy === "name" || name.trim() === user.name}><Save size={16} />{busy === "name" ? "Salvando..." : "Salvar alterações"}</button>
              </form>
            </section>
            <section className="panel account-panel security-panel">
              <div className="account-panel-heading"><span className="account-section-icon security-icon"><KeyRound size={19} /></span><div><h2>Segurança</h2><p>Atualize sua senha para manter sua conta protegida.</p></div></div>
              <form className="account-form password-form" onSubmit={changePassword}>
                <label>Senha atual<input name="currentPassword" type="password" autoComplete="current-password" minLength={8} maxLength={72} required /></label>
                <label>Nova senha<input name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /><small>Use pelo menos 8 caracteres.</small></label>
                <label>Confirme a nova senha<input name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></label>
                <button className="button button-dark account-save" type="submit" disabled={busy === "password"}><LockKeyhole size={16} />{busy === "password" ? "Atualizando..." : "Alterar senha"}</button>
              </form>
            </section>
          </div>
          <footer className="dashboard-footer"><span>© 2025 Monevo · Seu dinheiro, no ritmo certo.</span><span><ShieldCheck size={14} /> Seus dados são privados</span></footer>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, value, icon, tone, footer }: { title: string; value: number; icon: ReactNode; tone: string; footer: string }) {
  return <div className={`summary-card summary-${tone}`}><div className="summary-card-top"><span>{title}</span><span className="summary-icon">{icon}</span></div><b className="summary-value">{money.format(value)}</b><div className="summary-footer">{tone === "teal" ? <ArrowDownRight size={14} /> : tone === "red" ? <ArrowUpRight size={14} /> : <span className="summary-footer-dot" />}{footer}</div></div>;
}

function StatusBadge({ status }: { status: Bill["status"] }) {
  const labels = { paid: "Paga", pending: "Pendente", overdue: "Atrasada" };
  return <span className={`status-badge badge-${status}`}><span />{labels[status]}</span>;
}

function BillDialog({ value, onClose, onSaved }: { value: Bill | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const categories = ["Moradia", "Alimentação", "Transporte", "Saúde", "Educação", "Assinaturas", "Lazer", "Outros"];
  const [category, setCategory] = useState(value?.category ?? "Moradia");
  const [customCategory, setCustomCategory] = useState(value && !categories.includes(value.category) ? value.category : "");
  const isCustom = !categories.includes(category);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const bill: BillInput = {
      title: String(formData.get("title") ?? "").trim(),
      category: isCustom || category === "Outros"
        ? customCategory.trim() || (isCustom ? category : "Outros")
        : category,
      amount: Number(String(formData.get("amount") ?? "").replace(",", ".")),
      dueDate: String(formData.get("dueDate") ?? ""),
      notes: String(formData.get("notes") ?? "").trim(),
    };
    try {
      await api(`/bills${value ? `/${value.id}` : ""}`, {
        method: value ? "PATCH" : "POST",
        body: JSON.stringify(bill),
      });
      await onSaved();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar a conta.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="bill-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
    <div className="dialog-heading"><div><span className="panel-kicker">{value ? "ATUALIZE OS DETALHES" : "NOVA DESPESA"}</span><h2 id="dialog-title">{value ? "Editar conta" : "Adicionar conta"}</h2><p>{value ? "Mantenha as informações sempre em dia." : "Organize um novo compromisso financeiro."}</p></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>
    <form className="bill-form" onSubmit={submit}>
      <label>Nome da conta<input name="title" defaultValue={value?.title} placeholder="Ex.: Conta de energia" required maxLength={100} /></label>
      <div className="form-row"><label>Categoria<select value={isCustom ? "Outros" : category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Valor<input name="amount" type="number" defaultValue={value?.amount} placeholder="0,00" min="0.01" step="0.01" required /></label></div>
      {(isCustom || category === "Outros") && <label>Nome da categoria<input value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} placeholder="Ex.: Pets" maxLength={40} /></label>}
      <label>Data de vencimento<input name="dueDate" type="date" defaultValue={value?.dueDate.slice(0, 10)} required /></label>
      <label>Observação <span className="optional-label">opcional</span><textarea name="notes" defaultValue={value?.notes ?? ""} placeholder="Adicione um lembrete ou detalhe" rows={3} maxLength={500} /></label>
      {error && <div role="alert" className="form-error">{error}</div>}
      <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancelar</button><button type="submit" className="button button-dark" disabled={busy}>{busy ? "Salvando..." : value ? "Salvar alterações" : "Adicionar conta"} <ArrowRight size={16} /></button></div>
    </form>
  </section></div>;
}

export default App;

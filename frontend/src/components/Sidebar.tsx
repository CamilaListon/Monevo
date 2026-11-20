import {
  ArrowUpRightFromSquare,
  CheckCircle2,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Repeat,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "./Brand";

type SidebarPage = "dashboard" | "account";
type DashboardSection =
  "Visão geral" | "Minhas contas" | "Contas recorrentes" | "Pagamentos";

interface SidebarProps {
  page: SidebarPage;
  activeSection?: string;
  mobileMenu: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSectionChange?: (section: DashboardSection, target: string) => void;
}

export default function Sidebar({
  page,
  activeSection = "Visão geral",
  mobileMenu,
  onClose,
  onLogout,
  onSectionChange,
}: SidebarProps) {
  const dashboardLinks: {
    label: DashboardSection;
    icon: typeof LayoutDashboard;
    target: string;
  }[] = [
    { label: "Visão geral", icon: LayoutDashboard, target: "/dashboard" },
    {
      label: "Minhas contas",
      icon: CreditCard,
      target: "/dashboard#bills-section",
    },
    {
      label: "Contas recorrentes",
      icon: Repeat,
      target: "/dashboard#recurring-section",
    },
    {
      label: "Pagamentos",
      icon: CheckCircle2,
      target: "/dashboard#payments-section",
    },
  ];

  return (
    <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <Brand />
      </div>
      <div className="sidebar-label">MENU</div>
      <nav className="side-nav">
        {dashboardLinks.map(({ label, icon: Icon, target }) =>
          page === "dashboard" ? (
            <button
              key={label}
              className={`side-link ${activeSection === label ? "side-active" : ""}`}
              onClick={() => onSectionChange?.(label, target)}
            >
              <Icon size={18} /> {label}
            </button>
          ) : (
            <Link
              key={label}
              className="side-link"
              to={target}
              onClick={onClose}
            >
              <Icon size={18} /> {label}
            </Link>
          ),
        )}
        {page === "account" ? (
          <Link
            className="side-link side-active"
            to="/account"
            onClick={onClose}
          >
            <UserRound size={18} /> Perfil
          </Link>
        ) : (
          <Link className="side-link" to="/account">
            <UserRound size={18} /> Perfil
          </Link>
        )}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <span>
            <CircleHelp size={17} />
          </span>
          <b>Precisa de ajuda?</b>
          <p>Estamos aqui para você.</p>
          <a href="mailto:ajuda@monevo.app">
            Fale com a gente <ArrowUpRightFromSquare size={13} />
          </a>
        </div>
        <button className="side-link logout-link" onClick={onLogout}>
          <LogOut size={18} /> Sair da conta
        </button>
      </div>
    </aside>
  );
}

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
    <aside
      className={`fixed inset-y-0 left-0 z-[8] flex w-[232px] flex-col border-r border-[#e9ede6] bg-white px-[15px] pb-[17px] pt-[26px] dark:border-[#293a31] dark:bg-dark-raised max-[1080px]:w-[205px] max-[820px]:z-[13] max-[820px]:w-[250px] max-[820px]:transition-transform max-[820px]:duration-[220ms] max-[820px]:shadow-[8px_0_30px_#12251f13] ${mobileMenu ? "max-[820px]:translate-x-0" : "max-[820px]:-translate-x-full"}`}
    >
      <div className="px-[11px] pb-[34px] [&_a]:text-[23px]">
        <Brand />
      </div>
      <div className="px-3 text-[10px] font-bold tracking-[1.35px] text-[#a0aaa4] dark:text-[#9eafa5]">
        MENU
      </div>
      <nav className="mt-3 flex flex-col gap-[5px]">
        {dashboardLinks.map(({ label, icon: Icon, target }) =>
          page === "dashboard" ? (
            <button
              key={label}
              className={`flex min-h-[42px] w-full items-center gap-3 rounded-lg border-0 px-3 text-left text-[12px] font-medium transition-colors ${activeSection === label ? "bg-[#eaf3ef] font-semibold text-forest dark:bg-[#20372d] dark:text-[#d7eee3] [&_svg]:text-teal" : "bg-transparent text-[#74817b] hover:bg-[#f5f8f4] hover:text-forest dark:text-[#c1d0c7] dark:hover:bg-[#1c2c24] dark:hover:text-[#e5eee8]"}`}
              onClick={() => onSectionChange?.(label, target)}
            >
              <Icon size={18} /> {label}
            </button>
          ) : (
            <Link
              key={label}
              className="flex min-h-[42px] w-full items-center gap-3 rounded-lg px-3 text-[12px] font-medium text-[#74817b] transition-colors hover:bg-[#f5f8f4] hover:text-forest dark:text-[#c1d0c7] dark:hover:bg-[#1c2c24] dark:hover:text-[#e5eee8]"
              to={target}
              onClick={onClose}
            >
              <Icon size={18} /> {label}
            </Link>
          ),
        )}
        {page === "account" ? (
          <Link
            className="flex min-h-[42px] w-full items-center gap-3 rounded-lg bg-[#eaf3ef] px-3 text-[12px] font-semibold text-forest dark:bg-[#20372d] dark:text-[#d7eee3] [&_svg]:text-teal"
            to="/account"
            onClick={onClose}
          >
            <UserRound size={18} /> Perfil
          </Link>
        ) : (
          <Link
            className="flex min-h-[42px] w-full items-center gap-3 rounded-lg px-3 text-[12px] font-medium text-[#74817b] transition-colors hover:bg-[#f5f8f4] hover:text-forest dark:text-[#c1d0c7] dark:hover:bg-[#1c2c24] dark:hover:text-[#e5eee8]"
            to="/account"
          >
            <UserRound size={18} /> Perfil
          </Link>
        )}
      </nav>
      <div className="mt-auto">
        <div className="mx-1 mb-[14px] rounded-[10px] border border-[#e9eee7] bg-[#fbfcfa] p-[14px] dark:border-[#2d4036] dark:bg-[#1c2c24]">
          <span className="mb-[10px] grid size-7 place-items-center rounded-lg bg-[#e5f1eb] text-teal dark:bg-[#20372d]">
            <CircleHelp size={17} />
          </span>
          <b className="block text-[12px] text-[#31483e] dark:text-[#e2ece5]">
            Precisa de ajuda?
          </b>
          <p className="my-[5px] mb-[9px] text-[10px] text-[#87928c] dark:text-[#a5b5ac]">
            Estamos aqui para você.
          </p>
          <a
            className="inline-flex items-center gap-[5px] text-[10px] font-semibold text-teal"
            href="mailto:ajuda@monevo.app"
          >
            Fale com a gente <ArrowUpRightFromSquare size={13} />
          </a>
        </div>
        <button
          className="flex min-h-[42px] w-full items-center gap-3 rounded-none border-0 border-t border-[#eff1ed] bg-transparent px-3 pt-3 text-left text-[12px] font-medium text-[#74817b] transition-colors hover:bg-[#f5f8f4] hover:text-forest dark:border-[#293a31] dark:text-[#c1d0c7] dark:hover:bg-[#1c2c24] dark:hover:text-[#e5eee8]"
          onClick={onLogout}
        >
          <LogOut size={18} /> Sair da conta
        </button>
      </div>
    </aside>
  );
}

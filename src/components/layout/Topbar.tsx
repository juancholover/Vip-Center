import { Bell, Search, Menu } from "lucide-react";
import logo from "../../assets/logo.svg";

interface Props {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: Props) {
  return (
    <header className="h-14 border-b border-white/5 bg-[#171B22]/80 backdrop-blur flex items-center justify-between px-4 sm:px-6">
      {/* Logo + Texto */}
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa (solo en mobile) */}
        <button
          onClick={onMenuClick}
          className="sm:hidden p-2 rounded-lg hover:bg-white/10 text-slate-300"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo VIP" className="h-9 w-9" />
          <div className="font-semibold tracking-tight">
            <span className="text-emerald-400">VIP</span>{" "}
            <span className="text-slate-200">Center</span>{" "}
            <span className="text-orange-400">Fit</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-3xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search.."
            className="w-full h-10 rounded-lg bg-[#0F1318] border border-white/10 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="relative grid place-items-center h-9 w-9 rounded-lg bg-[#0F1318] border border-white/10 hover:bg-[#1F2430]">
          <Bell className="h-5 w-5 text-slate-300" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-[10px] grid place-items-center">
            3
          </span>
        </button>
        <div className="h-9 w-9 rounded-full overflow-hidden border border-white/10">
          <img
            alt="avatar"
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=200&auto=format&fit=crop"
          />
        </div>
      </div>
    </header>
  );
}

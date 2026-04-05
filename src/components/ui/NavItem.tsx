import { type LucideIcon } from "lucide-react";

interface Props {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

export default function NavItem({ label, icon: Icon, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-[#1F2430] text-slate-100"
          : "text-slate-300 hover:bg-white/5"
      }`}
    >
      <span
        className={`grid place-items-center h-5 w-5 rounded-sm ${
          active
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-white/5 text-slate-300"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </button>
  );
}

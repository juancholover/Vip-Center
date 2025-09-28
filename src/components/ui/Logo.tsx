import logoSvg from '../../assets/logo.svg';

export default function Logo() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-lg flex items-center justify-center overflow-hidden">
        <img 
          src={logoSvg} 
          alt="VIP Center Fit Logo" 
          className="h-full w-full object-contain"
        />
      </div>
      <div className="font-semibold tracking-tight text-lg">
        <span className="text-emerald-400">VIP</span>{" "}
        <span className="text-slate-200">Center</span>{" "}
        <span className="text-orange-400">Fit</span>
      </div>
    </div>
  );
}
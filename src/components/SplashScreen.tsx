export default function SplashScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F1318] text-white">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-300">Cargando sistema...</p>
      </div>
    </div>
  );
}

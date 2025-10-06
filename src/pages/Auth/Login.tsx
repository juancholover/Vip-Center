import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { loginRequest } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginRequest({ email, password });
      login(data);
      navigate("/");
    } catch {
      setError("Credenciales incorrectas o usuario inactivo");
    }
  };

  return (
    <div className="h-screen bg-[#0F1318] text-white flex flex-col justify-center items-center">
      <img src={logo} alt="VIP Center Fit" className="h-20 mb-4 animate-bounce" />
      <h1 className="text-2xl font-semibold mb-6">
        <span className="text-emerald-400">VIP</span>{" "}
        <span className="text-slate-200">Center</span>{" "}
        <span className="text-yellow-400">Fit</span>
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-[#171B22] p-6 rounded-xl w-80 shadow-lg border border-white/10"
      >
        <label className="block text-sm mb-2">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-[#0F1318] border border-white/10 mb-4 text-sm"
          required
        />

        <label className="block text-sm mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-[#0F1318] border border-white/10 mb-6 text-sm"
          required
        />

        {error && (
          <p className="text-red-400 text-xs mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 py-2 rounded text-sm font-semibold"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

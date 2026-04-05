import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-hot-toast";
import { AccesoApi, type VerificarAccesoResponse, type AsistenciaRecienteDTO, type ClienteBusquedaDTO } from "../../api/accesoApi";
import { useAuthStore } from "../../store/useAuthStore";
import ModalAccesoAprobado from "./ModalAccesoAprobado";
import ModalAccesoDenegado from "../../components/ModalAccesoDenegado";
import ModalBusquedaManual from "./ModalBusquedaManual";
import { QrCode, Search, CheckCircle, Calendar, User } from "lucide-react";

type ModoVista = "ESCANEO" | "ACCESO_APROBADO" | "ACCESO_DENEGADO";

export default function ControlAcceso() {
  const { user } = useAuthStore();
  
  // Estados principales
  const [modo, setModo] = useState<ModoVista>("ESCANEO");
  const [clienteActual, setClienteActual] = useState<VerificarAccesoResponse | null>(null);
  const [ultimasAsistencias, setUltimasAsistencias] = useState<AsistenciaRecienteDTO[]>([]);
  const [contadorDia, setContadorDia] = useState<number>(0);
  
  // Estados de búsqueda manual
  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ClienteBusquedaDTO[]>([]);
  const [buscando, setBuscando] = useState(false);
  
  // Estados de cámara
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [camaraFrontal] = useState(false);
  const [escanerListo, setEscanerListo] = useState(false);
  
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const [horaActual, setHoraActual] = useState(new Date());
  const ultimoQRRef = useRef<string | null>(null);
  const ultimoEscaneoRef = useRef<number>(0);

  // Actualizar hora cada segundo
  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [asistencias, contador] = await Promise.all([
        AccesoApi.obtenerAsistenciasRecientes(5),
        AccesoApi.obtenerContadorDia(),
      ]);
      
      setUltimasAsistencias(asistencias);
      setContadorDia(contador.total);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  // Inicializar escáner QR
  useEffect(() => {
    console.log("📷 useEffect escáner - modo:", modo, "cámara activa:", camaraActiva);
    
    if (modo === "ESCANEO" && !camaraActiva) {
      console.log("🚀 Iniciando cámara...");
      iniciarCamara();
    }
    
    return () => {
      console.log("🛑 Limpiando escáner...");
      detenerCamara();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  const iniciarCamara = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrScannerRef.current = html5QrCode;

      const onScanSuccessCallback = (decodedText: string, decodedResult: unknown) => {
        console.log("🔍 QR escaneado:", decodedText);
        console.log("📊 Resultado completo:", decodedResult);
        
        const ahora = Date.now();
        const COOLDOWN_MS = 5000;
        
        // Evitar escaneos duplicados
        if (
          ultimoQRRef.current === decodedText && 
          ahora - ultimoEscaneoRef.current < COOLDOWN_MS
        ) {
          console.log("⏱️ QR duplicado ignorado (cooldown activo)");
          return;
        }
        
        console.log("✅ QR aceptado, procesando...");
        ultimoQRRef.current = decodedText;
        ultimoEscaneoRef.current = ahora;
        handleQRScan(decodedText);
      };

      const onScanErrorCallback = () => {
        // Logging silencioso para debug
        // No mostrar errores de "No QR found"
      };

      const config = {
        fps: 20,
        qrbox: { width: 350, height: 350 },
        aspectRatio: 1.0,
        formatsToSupport: [0],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        disableFlip: false,
        rememberLastUsedCamera: true
      };

      console.log("🎥 Solicitando permisos de cámara...");
      
      await html5QrCode.start(
        { facingMode: camaraFrontal ? "user" : "environment" },
        config,
        onScanSuccessCallback,
        onScanErrorCallback
      );

      setCamaraActiva(true);
      setEscanerListo(true);
      
      console.log("✅ Cámara iniciada correctamente");
      console.log("📸 Scanner listo para detectar QR");
      console.log("⚙️ Estado del scanner:", html5QrCode.getState());
      
      // Verificar que el scanner está realmente escaneando
      setTimeout(() => {
        if (qrScannerRef.current) {
          console.log("🔄 Verificando estado del scanner...");
          console.log("Estado actual:", qrScannerRef.current.getState());
          console.log("¿Está escaneando?", qrScannerRef.current.isScanning);
        }
      }, 1000);
      
      // Forzar limpieza de elementos duplicados después de iniciar
      setTimeout(() => {
        const reader = document.getElementById("qr-reader");
        if (reader) {
          const videos = reader.querySelectorAll("video");
          console.log("Videos encontrados:", videos.length);
          // Mantener solo el primer video, eliminar duplicados
          videos.forEach((video, index) => {
            if (index > 0) {
              video.remove();
              console.log("Video duplicado eliminado");
            }
          });
        }
      }, 500);
    } catch (error) {
      console.error("❌ Error al iniciar cámara:", error);
      toast.error("No se pudo acceder a la cámara");
    }
  };

  const detenerCamara = async () => {
    if (qrScannerRef.current && camaraActiva) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
        setCamaraActiva(false);
        setEscanerListo(false);
      } catch (error) {
        console.error("Error al detener cámara:", error);
      }
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      console.log("🔄 Procesando QR:", qrData);
      
      // El QR ahora es simplemente el UUID (qr_acceso)
      // Ya no usamos formatos como VIP-CLIENT-123
      const qrToken = qrData.trim();

      if (!qrToken || qrToken.length < 10) {
        console.log("❌ QR inválido - longitud:", qrToken.length);
        mostrarAccesoDenegado({
          accesoPermitido: false,
          motivo: "QR_INVALIDO",
          cliente: null,
        });
        return;
      }

      console.log("📡 Verificando acceso con QR:", qrToken);
      
      // Verificar acceso usando el token UUID
      const response = await AccesoApi.verificarAccesoConQR(qrToken);

      console.log("📥 Respuesta del servidor:", response);

      if (response.accesoPermitido) {
        console.log("✅ Acceso permitido, registrando asistencia...");
        
        // Registrar asistencia automáticamente
        await AccesoApi.registrarAsistenciaConQR({
          qrToken,
          tipoRegistro: "QR_AUTO",
          empleadoId: 1, // Usuario del sistema
        });

        mostrarAccesoAprobado(response);
        
        // Actualizar lista de asistencias
        cargarDatos();
      } else {
        console.log("❌ Acceso denegado:", response.motivo);
        mostrarAccesoDenegado(response);
      }
    } catch (error) {
      console.error("💥 Error al verificar acceso:", error);
      toast.error("Error al verificar acceso");
    }
  };

  const mostrarAccesoAprobado = (response: VerificarAccesoResponse) => {
    detenerCamara();
    setModo("ACCESO_APROBADO");
    setClienteActual(response);
    reproducirSonido("success");

    // Volver a escaneo después de 5 segundos (aumentado de 3 a 5)
    setTimeout(() => {
      setModo("ESCANEO");
      setClienteActual(null);
      // Reiniciar cámara automáticamente
      setTimeout(() => {
        iniciarCamara();
      }, 500);
    }, 5000);
  };

  const mostrarAccesoDenegado = (response: VerificarAccesoResponse) => {
    detenerCamara();
    setModo("ACCESO_DENEGADO");
    setClienteActual(response);
    reproducirSonido("error");
  };

  const cerrarAccesoDenegado = () => {
    setModo("ESCANEO");
    setClienteActual(null);
  };

  const reproducirSonido = (tipo: "success" | "error") => {
    try {
      const audio = new Audio(`/sounds/${tipo}.mp3`);
      audio.volume = 0.5;
      audio.play().catch(() => console.log("No se pudo reproducir sonido"));
    } catch (error) {
      console.log("Error al reproducir sonido:", error);
    }
  };

  const abrirBusquedaManual = () => {
    setModalBusquedaAbierto(true);
    detenerCamara();
  };

  const cerrarBusquedaManual = () => {
    setModalBusquedaAbierto(false);
    setTerminoBusqueda("");
    setResultadosBusqueda([]);
  };

  const buscarClientes = async () => {
    if (!terminoBusqueda.trim()) {
      toast.error("Ingrese un término de búsqueda");
      return;
    }

    try {
      setBuscando(true);
      const resultados = await AccesoApi.buscarClientes(terminoBusqueda);
      setResultadosBusqueda(resultados);

      if (resultados.length === 0) {
        toast("No se encontraron clientes", { icon: "ℹ️" });
      }
    } catch (error) {
      console.error("Error al buscar:", error);
      toast.error("Error al buscar clientes");
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarCliente = async (cliente: ClienteBusquedaDTO) => {
    try {
      cerrarBusquedaManual();

      const response = await AccesoApi.verificarAcceso(cliente.id);

      if (response.accesoPermitido) {
        await AccesoApi.registrarAsistencia({
          clienteId: cliente.id,
          tipoRegistro: "MANUAL_STAFF",
          empleadoId: 1, // TODO: obtener del auth store
        });

        mostrarAccesoAprobado(response);
        cargarDatos();
      } else {
        mostrarAccesoDenegado(response);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar acceso");
    }
  };

  const formatearHora = (fechaHora: string) => {
    return new Date(fechaHora).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {/* HEADER */}
      <header className="bg-[#1e293b] px-6 py-4 rounded-b-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Control de Acceso
              </h1>
              <p className="text-sm text-gray-400">
                <User className="w-3 h-3 inline mr-1" />
                {user?.nombre} {user?.apellido} |{" "}
                {horaActual.toLocaleDateString("es-PE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg px-6 py-3">
            <div className="text-3xl font-bold text-green-400">
              {contadorDia}
            </div>
            <div className="text-xs text-gray-300">Ingresos Hoy</div>
          </div>
        </div>
      </header>

      {/* ÁREA CENTRAL */}
      <main className="flex-1 p-6">
        {modo === "ESCANEO" && (
          <div className="max-w-2xl mx-auto">
            {/* Visor QR */}
            <div className="bg-[#1e293b] rounded-2xl p-6 mb-6">
              <h3 className="text-white text-center font-semibold mb-4 text-lg flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" />
                Escanear Código QR
              </h3>
              <div className="relative mx-auto" style={{ maxWidth: '450px' }}>
                <style>{`
                  /* Limpieza agresiva de html5-qrcode */
                  #qr-reader {
                    border: none !important;
                    position: relative !important;
                    width: 100% !important;
                    max-width: 450px !important;
                    margin: 0 auto !important;
                  }
                  #qr-reader video {
                    width: 100% !important;
                    height: auto !important;
                    display: block !important;
                    border-radius: 12px !important;
                  }
                  /* Eliminar elementos duplicados */
                  #qr-reader video:nth-of-type(n+2) {
                    display: none !important;
                  }
                  #qr-reader canvas {
                    display: none !important;
                  }
                  #qr-reader img {
                    display: none !important;
                  }
                  /* Mantener el recuadro de escaneo (qrbox) */
                  #qr-shaded-region {
                    border: 3px solid rgba(34, 197, 94, 0.8) !important;
                    box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5) !important;
                  }
                  /* Ocultar dashboard y controles */
                  #qr-reader__dashboard {
                    display: none !important;
                  }
                  #qr-reader__dashboard_section {
                    display: none !important;
                  }
                  #qr-reader__dashboard_section_swaplink {
                    display: none !important;
                  }
                  #qr-reader__dashboard_section_csr {
                    display: none !important;
                  }
                  #qr-reader__camera_permission_button {
                    display: none !important;
                  }
                  #qr-reader__header_message {
                    display: none !important;
                  }
                  #qr-reader__status_span {
                    display: none !important;
                  }
                `}</style>
                <div
                  id="qr-reader"
                  className="rounded-xl overflow-hidden shadow-2xl"
                  style={{ width: "100%" }}
                />
                {!escanerListo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 rounded-xl z-50">
                    <div className="text-white text-center">
                      <QrCode className="w-12 h-12 mb-3 mx-auto animate-pulse" />
                      <div className="text-sm">Iniciando cámara...</div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center text-slate-400 text-xs mt-4">
                Coloca el código QR dentro del recuadro verde para escanear
              </p>
            </div>

            {/* Búsqueda Manual */}
            <div className="bg-[#1e293b] rounded-2xl p-6">
              <button
                onClick={abrirBusquedaManual}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition shadow-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Buscar Cliente
              </button>
            </div>
          </div>
        )}

        {modo === "ACCESO_APROBADO" && clienteActual && (
          <ModalAccesoAprobado
            visible={true}
            cliente={clienteActual}
          />
        )}

        {modo === "ACCESO_DENEGADO" && clienteActual && (
          <ModalAccesoDenegado
            visible={true}
            onClose={cerrarAccesoDenegado}
            cliente={clienteActual}
          />
        )}
      </main>

      {/* FOOTER - Últimos Ingresos */}
      <footer className="bg-[#1e293b] px-6 py-4 border-t-2 border-green-500">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Últimos Ingresos
          </h3>
          <div className="space-y-2">
            {ultimasAsistencias.map((asistencia) => (
              <div
                key={asistencia.id}
                className="flex items-center gap-3 text-sm text-gray-300 bg-[#0f172a] rounded-lg px-4 py-2"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">
                  {formatearHora(asistencia.fechaHora)}
                </span>
                <span className="flex-1">{asistencia.cliente.nombreCompleto}</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                  {asistencia.cliente.membresiaTipo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </footer>

      {/* Modal de Búsqueda Manual */}
      <ModalBusquedaManual
        visible={modalBusquedaAbierto}
        onClose={cerrarBusquedaManual}
        terminoBusqueda={terminoBusqueda}
        setTerminoBusqueda={setTerminoBusqueda}
        onBuscar={buscarClientes}
        resultados={resultadosBusqueda}
        buscando={buscando}
        onSeleccionar={seleccionarCliente}
      />
    </div>
  );
}

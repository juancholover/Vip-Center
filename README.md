# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Documentación de Pagos y Notificaciones

Se añadió una guía detallada sobre la integración de pagos con Yape (MercadoPago), notificaciones (email + SMS) y el flujo de reembolsos:

- `docs/PAGOS_YAPE_NOTIFICACIONES.md` - Guía completa de integración
- `docs/CONFIGURACION_YAPE.md` - Configuración específica para Yape
- `docs/MODO_PRUEBA_QR.md` - 🧪 Configuración para pruebas con QR
- `docs/QR_AMPLIABLE.md` - 📲 Funcionalidad de QR clickeable y ampliable
- `docs/FORMULARIO_MEJORADO.md` - 📋 Campos adicionales y validaciones
- `docs/INTEGRACION_BACKEND.md` - 🔌 Guía de integración con backend existente
- `docs/SISTEMA_QR_ASISTENCIA.md` - 📲 Sistema completo de asistencias con QR
- `docs/BACKEND_ASISTENCIA_GUIA.md` - 🔧 Guía técnica de backend para asistencias
- `docs/INICIO_RAPIDO_ASISTENCIAS.md` - ⚡ Inicio rápido en 3 pasos
- `docs/RESUMEN_IMPLEMENTACION_ASISTENCIAS.md` - 📋 Resumen ejecutivo completo


# App de apoyo al turista · Copa Mundial 2026

## Estructura
- `frontend/` React + Vite + TypeScript con TailwindCSS 3 y DaisyUI preconfigurados.
- `backend/` Carpeta reservada para la configuración de Firebase (Auth, Firestore, Storage, Functions).

## Frontend
1) Instalar dependencias (ya ejecutado en esta copia):
   - Desde `frontend/`: `npm install`
2) Ejecutar en desarrollo:
   - `npm run dev`
3) Stack visual:
   - TailwindCSS 3 + DaisyUI (temas `emerald` y `light` activados).

## Backend (Firebase)
1) CLI: `npm install -g firebase-tools`
2) Login e init en `/backend`: `firebase login` y luego `firebase init` (elige Firestore, Functions, Storage/Hosting según lo requerido).
3) En `backend/functions`: `npm install firebase-admin firebase-functions` para Cloud Functions (Node 20 recomendado).
4) Configura reglas de Firestore/Storage y servicios para chat en tiempo real, presencia, transferencias y WebRTC signaling para videollamadas 1:1.

## Próximos pasos sugeridos
- Conectar frontend a Firebase Auth/Firestore/Storage con SDK modular v10+.
- Definir modelo de datos de chats (grupal y 1:1), tareas y recompensas.
- Añadir servicio de WebSockets/WebRTC para videollamadas y presencia en tiempo real.
- Implementar envío de correos vía Cloud Functions o proveedor SMTP.

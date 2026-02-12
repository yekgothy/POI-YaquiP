# Backend (Firebase scaffold)

Este folder está reservado para la configuración de Firebase (Auth, Firestore, Storage y Functions) y para cualquier microservicio complementario.

## Próximos pasos
1) Instala la CLI: `npm install -g firebase-tools`.
2) Autentica y crea proyecto: `firebase login` y `firebase init` (elige Functions, Firestore, Hosting/Storage según necesidad).
3) En `functions/` ejecuta `npm install firebase-admin firebase-functions` para Cloud Functions y configura el runtime Node 20.
4) Define reglas de seguridad de Firestore y Storage acorde a los requerimientos (chat, archivos, estados de conexión).
5) Considera un servicio de WebRTC signaling (puede ser Cloud Functions + WebSockets) para videollamadas 1:1.

Estructura sugerida:
- `firebase/` Archivos de configuración (`firebase.json`, `.firebaserc`).
- `functions/` Código de Cloud Functions (WebSockets, correos, notificaciones, gamificación).

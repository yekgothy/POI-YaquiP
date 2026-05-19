# 🎥 Videollamadas con mediasoup - Guía de Setup

## ✅ Lo que ya está implementado:

### Backend
- ✅ Tablas en DB (calls, call_participants)
- ✅ Rutas REST (`/api/calls/start`, `/api/calls/join`, `/api/calls/end`, `/api/calls/history`)
- ✅ Socket.io events (`call:initiate`, `call:accept`, `call:reject`, `call:ended`)
- ✅ Señalización WebRTC con Socket.IO + mediasoup

### Frontend
- ✅ Hook `useMediasoupCall` para manejar transports, producers y consumers
- ✅ `CallContext` para estado global de llamadas
- ✅ Componente `CallInvitation` para notificaciones de llamadas entrantes
- ✅ Componente `DailyCall` con UI propia sobre mediasoup
- ✅ Botón de llamada integrado en ChatView
- ✅ API client para interactuar con rutas de calls
- ✅ Instalación de `mediasoup` y `mediasoup-client`

---

## 🔧 Pasos para completar la configuración:

### 1. Configurar entorno de backend
En `backend/.env` agrega o confirma estos valores:

```env
MEDIASOUP_LISTEN_IP=127.0.0.1
MEDIASOUP_ANNOUNCED_IP=
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=49999
MEDIASOUP_LOG_LEVEL=warn
```

Para desarrollo local, `MEDIASOUP_ANNOUNCED_IP` puede ir vacío.

### 2. Configurar variables de entorno generales

**Backend (.env)**
```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=tu_jwt_secret
```

El archivo `.env.example` ya está creado. Cópialo a `.env` y rellena los valores.

### 3. Instalar paquetes faltantes (si es necesario)

**Backend**
```bash
cd backend
npm install
```

**Frontend** (ya está hecho)
```bash
cd frontend
npm install
```

### 4. Ejecutar la aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm start  # o npm run dev para desarrollo
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🎯 Funcionalidad implementada:

### Flujo de llamada 1-a-1:
1. Usuario A clickea botón "Llamada" en chat DM
2. Se inicia un call y se notifica a Usuario B
3. Usuario B ve el modal de `CallInvitation`
4. Si acepta, se abre la interfaz de video
5. Ambos pueden toglear cámara/micrófono
6. Al colgar, se registra en el historial

### Flujo de llamada grupal:
1. Usuario A clickea "Llamada" en canal
2. Se crea una llamada grupal y se notifica a todos
3. Múltiples usuarios pueden aceptar
4. Se registra a todos como participantes

---

## 📱 Componentes principales:

### `useMediasoupCall` Hook
Maneja:
- Join a la sala de mediasoup
- Send/recv transports
- Toggles de cámara/micrófono
- Manejo de participantes remotos

### `CallContext`
Maneja:
- Estado de llamadas activas
- Socket events
- Aceptar/rechazar llamadas

### `CallInvitation` Component
- Modal para mostrar llamadas entrantes
- Botones de aceptar/rechazar
- Avatar y nombre del llamante

### `DailyCall` Component
- Renderiza la UI propia de video
- Controles de video/audio
- Botón de colgar

### API (`callsApi.ts`)
Funciones:
- `startCall()` - Inicia una nueva llamada
- `joinCall()` - Se une a una llamada existente
- `endCall()` - Finaliza una llamada
- `getCallHistory()` - Obtiene historial de llamadas

---

## 🔌 Socket.io Events

### Cliente → Servidor
- `call:initiate` - Inicia una llamada
- `call:accept` - Acepta una llamada entrante
- `call:reject` - Rechaza una llamada
- `call:ended` - Termina una llamada

### Servidor → Cliente
- `call:incoming` - Notifica llamada entrante
- `call:accepted` - Notifica que fue aceptada
- `call:rejected` - Notifica que fue rechazada
- `call:ended` - Notifica que terminó

---

## 📊 Estructura de Datos

### Tabla `calls`
```sql
- id (uuid)
- room_name (text, único)
- initiated_by (uuid)
- channel_id (uuid, nullable)
- call_type ('direct' | 'group')
- status ('active' | 'ended')
- started_at, ended_at, duration_seconds
```

### Tabla `call_participants`
```sql
- id (uuid)
- call_id (uuid)
- user_id (uuid)
- joined_at, left_at, duration_seconds
```

---

## ⚠️ Notas importantes:

1. **Puertos UDP/TCP**: mediasoup usa puertos RTP dedicados. En local se controlan con `MEDIASOUP_MIN_PORT` y `MEDIASOUP_MAX_PORT`.

2. **Tokens**: Los tokens se generan por llamada y user_id, son válidos por 1 hora.

3. **Desarrollo vs Producción**: En producción, asegúrate de usar variables de entorno seguras.

4. **Límites de Daily**: Plan gratuito = 100 mins/día.

---

## 🐛 Troubleshooting:

**"Error: Cannot find module '@daily-co/daily-js'"**
→ Ejecuta: `npm install @daily-co/daily-js`

**"Token inválido"**
→ Verifica que DAILY_API_KEY esté correcto en .env

**"Room not found"**
→ Asegúrate que el room_name sea válido

**"Conexión Socket.io fallida"**
→ Verifica que el backend esté corriendo en puerto 4000

---

## 📚 Documentación útil:

- [Daily.co Documentation](https://docs.daily.co)
- [Daily.co API Reference](https://docs.daily.co/reference)
- [Socket.io Documentation](https://socket.io/docs/)

---

¡Ahora estás listo para usar videollamadas! 🚀

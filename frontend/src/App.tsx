function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white/80 to-emerald-50 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-6 rounded-2xl bg-white/80 p-8 shadow-lg shadow-emerald-100 backdrop-blur">
          <div className="flex flex-col gap-2">
            <span className="badge badge-success w-fit text-xs uppercase tracking-wide">Qatar 2026 · Demo</span>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              App de apoyo al turista · Copa Mundial FIFA 2026
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              Frontend listo con React + Vite + Tailwind + DaisyUI. Punto de partida para chat en tiempo real,
              ubicaciones y videollamadas 1:1.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="stats shadow-sm">
              <div className="stat">
                <div className="stat-title">Chat</div>
                <div className="stat-value text-emerald-600">Realtime</div>
                <div className="stat-desc">Grupal y 1 a 1</div>
              </div>
            </div>
            <div className="stats shadow-sm">
              <div className="stat">
                <div className="stat-title">Tareas</div>
                <div className="stat-value text-emerald-600">Equipos</div>
                <div className="stat-desc">Pendientes y progreso</div>
              </div>
            </div>
            <div className="stats shadow-sm">
              <div className="stat">
                <div className="stat-title">Seguridad</div>
                <div className="stat-value text-emerald-600">Cifrado</div>
                <div className="stat-desc">Mensajes opcional</div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="card bg-white/80 shadow-lg shadow-emerald-100">
            <div className="card-body">
              <h2 className="card-title">Próximos pasos</h2>
              <ul className="list-disc space-y-2 pl-5 text-slate-700">
                <li>Configurar Firebase (Auth, Firestore, Storage, Functions).</li>
                <li>Montar WebSockets/WebRTC para chat y videollamada 1:1.</li>
                <li>Diseñar módulos de tareas, recompensas y compartir ubicación.</li>
              </ul>
            </div>
          </div>

          <div className="card bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <div className="card-body">
              <h2 className="card-title">Checklist técnico</h2>
              <div className="flex flex-col gap-2 text-sm">
                <span className="badge badge-outline border-white/60 text-white">React + TypeScript</span>
                <span className="badge badge-outline border-white/60 text-white">Tailwind 3 + DaisyUI</span>
                <span className="badge badge-outline border-white/60 text-white">Vite listo para HMR</span>
              </div>
              <p className="text-sm opacity-90">
                Ejecuta <code className="rounded bg-white/10 px-2 py-1 font-mono text-xs">npm run dev</code> en frontend para
                ver los estilos cargados.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App

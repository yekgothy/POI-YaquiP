interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-base-200">
      {/* Panel izquierdo — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-center text-primary-content">
          {/* Icono / Logo */}
          <div className="mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-24 h-24 drop-shadow-lg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.466.733-3.559"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            POI Yaqui
          </h1>
          <p className="text-lg opacity-90 max-w-md leading-relaxed">
            Plataforma integral para la gestión y preservación del patrimonio
            cultural Yaqui.
          </p>

          {/* Indicadores decorativos */}
          <div className="flex gap-3 mt-10">
            <span className="w-3 h-3 rounded-full bg-primary-content/60" />
            <span className="w-3 h-3 rounded-full bg-primary-content/30" />
            <span className="w-3 h-3 rounded-full bg-primary-content/30" />
          </div>
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        {children}
      </div>
    </div>
  );
}

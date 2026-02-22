import { useState } from "react";
import AuthLayout from "./components/AuthLayout";
import InputField from "./components/InputField";
import SocialButton from "./components/SocialButton";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onRegister?: () => void;
}

export default function RegisterPage({ onSwitchToLogin, onRegister }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister?.();
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-[fadeInUp_0.5s_ease-out]">
        {/* Encabezado */}
        <div className="text-center mb-8">
          {/* Logo visible solo en móvil */}
          <div className="lg:hidden mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg shadow-secondary/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-primary-content"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-base-content">
            Crea tu cuenta
          </h2>
          <p className="text-base-content/60 mt-2">
            Únete a nuestra comunidad en solo unos pasos
          </p>
        </div>

        {/* Card del formulario */}
        <div className="card bg-base-100 shadow-xl border border-base-300/50">
          <div className="card-body gap-5">
            {/* Botones sociales */}
            <div className="flex gap-3">
              <SocialButton provider="google" />
              <SocialButton provider="github" />
            </div>

            {/* Divider */}
            <div className="divider text-xs text-base-content/40 my-1">
              o regístrate con tu correo
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                label="Nombre completo"
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={setName}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                }
              />

              <InputField
                label="Correo electrónico"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={setEmail}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                }
              />

              {/* Fila de contraseñas en 2 columnas en pantallas medianas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  }
                />

                <InputField
                  label="Confirmar contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  }
                />
              </div>

              {/* Indicador de fuerza de contraseña */}
              {password && (
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((level) => {
                    const strength =
                      (password.length >= 8 ? 1 : 0) +
                      (/[A-Z]/.test(password) ? 1 : 0) +
                      (/[0-9]/.test(password) ? 1 : 0) +
                      (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

                    const colors = [
                      "bg-error",
                      "bg-warning",
                      "bg-info",
                      "bg-success",
                    ];
                    const active = level <= strength;
                    return (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          active ? colors[strength - 1] : "bg-base-300"
                        }`}
                      />
                    );
                  })}
                </div>
              )}

              {/* Términos y condiciones */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="checkbox checkbox-primary checkbox-sm mt-0.5"
                />
                <span className="text-sm text-base-content/70 leading-relaxed">
                  Acepto los{" "}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Términos de servicio
                  </a>{" "}
                  y la{" "}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Política de privacidad
                  </a>
                </span>
              </label>

              {/* Botón principal */}
              <button
                type="submit"
                className="btn btn-primary w-full mt-2 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Crear cuenta
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-base-content/60 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-semibold hover:underline transition-colors"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

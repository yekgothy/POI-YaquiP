import { useState } from "react";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  error?: string;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  error,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <fieldset className="fieldset w-full">
      <legend
        className={`fieldset-legend text-sm font-semibold transition-colors duration-200 ${
          focused ? "text-primary" : "text-base-content/70"
        }`}
      >
        {label}
      </legend>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`input input-bordered w-full transition-all duration-200 ${
            icon ? "pl-10" : ""
          } ${
            focused
              ? "input-primary shadow-sm shadow-primary/20"
              : ""
          } ${error ? "input-error" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-error text-xs mt-1 ml-1">{error}</p>
      )}
    </fieldset>
  );
}

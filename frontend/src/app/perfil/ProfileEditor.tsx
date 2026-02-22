import { useState } from "react";
import UserAvatar from "../components/UserAvatar";
import type { UserProfile, SocialLink } from "./types";
import { countryFlags } from "./types";

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
  onCancel: () => void;
}

export default function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [email, setEmail] = useState(profile.email);
  const [favoriteTeam, setFavoriteTeam] = useState(profile.favoriteTeam);
  const [country, setCountry] = useState(profile.country);
  const [city, setCity] = useState(profile.city);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(profile.socialLinks);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = "El nombre es obligatorio";
    if (displayName.length > 32) newErrors.displayName = "Máximo 32 caracteres";
    if (!username.trim()) newErrors.username = "El nombre de usuario es obligatorio";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = "Solo letras, números y guión bajo";
    if (bio.length > 200) newErrors.bio = "Máximo 200 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        displayName,
        username,
        bio,
        email,
        favoriteTeam,
        country,
        city,
        socialLinks: socialLinks.filter((l) => l.url.trim()),
      });
    }
  };

  const updateSocialLink = (index: number, url: string) => {
    setSocialLinks((prev) => prev.map((l, i) => (i === index ? { ...l, url } : l)));
  };

  const addSocialLink = (platform: SocialLink["platform"]) => {
    if (!socialLinks.find((l) => l.platform === platform)) {
      setSocialLinks((prev) => [...prev, { platform, url: "" }]);
    }
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const teams = Object.keys(countryFlags);

  const platformLabels: Record<SocialLink["platform"], string> = {
    twitter: "X (Twitter)",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    website: "Sitio web",
  };

  const platformIcons: Record<SocialLink["platform"], string> = {
    twitter: "𝕏",
    instagram: "📷",
    tiktok: "🎵",
    youtube: "▶️",
    website: "🌐",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editar perfil</h2>
          <p className="text-sm text-base-content/50 mt-1">Personaliza cómo te ven los demás</p>
        </div>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Avatar + Banner preview */}
          <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-primary/30 via-warning/20 to-secondary/30 relative">
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
              >
                <span className="text-white/0 group-hover:text-white/80 text-sm font-medium flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                  </svg>
                  Cambiar banner
                </span>
              </button>
            </div>
            <div className="px-4 pb-4 -mt-8">
              <div className="relative w-fit">
                <UserAvatar name={displayName || "?"} size="xl" />
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 rounded-full transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/0 group-hover:text-white/90 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-base-content/40 mt-2">Haz clic para cambiar avatar o banner</p>
            </div>
          </div>

          {/* Información personal */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Información personal
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display name */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Nombre para mostrar *</span>
                    <span className="label-text-alt text-base-content/40">{displayName.length}/32</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${errors.displayName ? "input-error" : ""}`}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={32}
                    placeholder="Tu nombre"
                  />
                  {errors.displayName && <p className="text-error text-xs mt-1">{errors.displayName}</p>}
                </div>

                {/* Username */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Nombre de usuario *</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-0 w-full">
                    <span className="text-base-content/40">@</span>
                    <input
                      type="text"
                      className={`grow bg-transparent outline-none ${errors.username ? "text-error" : ""}`}
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="usuario"
                    />
                  </label>
                  {errors.username && <p className="text-error text-xs mt-1">{errors.username}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Correo electrónico</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              {/* Bio */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Biografía</span>
                  <span className="label-text-alt text-base-content/40">{bio.length}/200</span>
                </label>
                <textarea
                  className={`textarea textarea-bordered w-full min-h-20 ${errors.bio ? "textarea-error" : ""}`}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  placeholder="Cuéntanos sobre ti..."
                />
                {errors.bio && <p className="text-error text-xs mt-1">{errors.bio}</p>}
              </div>
            </div>
          </div>

          {/* Ubicación y equipo */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <span>⚽</span>
                Equipo y ubicación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Selección favorita</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={favoriteTeam}
                    onChange={(e) => setFavoriteTeam(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {teams.map((team) => (
                      <option key={team} value={team}>
                        {countryFlags[team]} {team}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">País</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="País"
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Ciudad</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ciudad"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          {/* Redes sociales */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                Redes sociales
              </h3>

              <div className="space-y-3">
                {socialLinks.map((link, i) => (
                  <div key={link.platform} className="flex items-center gap-2">
                    <span className="text-lg shrink-0">{platformIcons[link.platform]}</span>
                    <input
                      type="url"
                      className="input input-bordered input-sm flex-1"
                      value={link.url}
                      onChange={(e) => updateSocialLink(i, e.target.value)}
                      placeholder={`URL de ${platformLabels[link.platform]}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialLink(i)}
                      className="btn btn-ghost btn-xs btn-square text-error/50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new link */}
              <div className="flex flex-wrap gap-1">
                {(["twitter", "instagram", "tiktok", "youtube", "website"] as SocialLink["platform"][])
                  .filter((p) => !socialLinks.find((l) => l.platform === p))
                  .map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => addSocialLink(platform)}
                      className="btn btn-ghost btn-xs gap-1"
                    >
                      <span>{platformIcons[platform]}</span>
                      {platformLabels[platform]}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Preview card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-3">
              <h3 className="font-semibold text-base">Vista previa</h3>
              <div className="bg-base-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={displayName || "?"} size="lg" online={true} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{displayName || "Nombre"}</p>
                    <p className="text-xs text-base-content/40">@{username || "usuario"}</p>
                    {favoriteTeam && (
                      <p className="text-xs mt-1">
                        {countryFlags[favoriteTeam]} {favoriteTeam}
                      </p>
                    )}
                  </div>
                </div>
                {bio && (
                  <p className="text-xs text-base-content/60 mt-3 line-clamp-3">{bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-300">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Guardar cambios
        </button>
      </div>
    </form>
  );
}

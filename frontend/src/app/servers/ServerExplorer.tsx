import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface DiscoverServer {
  _id: string;
  name: string;
  createdByName: string;
  createdByUsername: string;
  isDefault: boolean;
}

interface ServerExplorerProps {
  onJoined: (serverId: string) => void;
}

export default function ServerExplorer({ onJoined }: ServerExplorerProps) {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [servers, setServers] = useState<DiscoverServer[]>([]);
  const [toastError, setToastError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const endpoint = search.trim()
      ? `/servers/discover?q=${encodeURIComponent(search.trim())}`
      : "/servers/discover";

    api<DiscoverServer[]>(endpoint, { token })
      .then(setServers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, search]);

  useEffect(() => {
    if (!toastError) return;
    const timer = window.setTimeout(() => setToastError(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toastError]);

  const handleJoin = async (serverId: string) => {
    if (!token) return;
    setJoiningId(serverId);
    try {
      await api(`/servers/${serverId}/join`, {
        token,
        method: "POST",
      });
      onJoined(serverId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo unir al servidor";
      setToastError(message);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {toastError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="alert alert-error shadow-lg">
            <span>{toastError}</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Explorar servidores</h1>
          <p className="text-sm text-base-content/50 mt-1">
            Busca por nombre de servidor o por creador
          </p>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <label className="input input-bordered flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.4 6.4a7.5 7.5 0 0 0 10.25 10.25Z"
                />
              </svg>
              <input
                type="text"
                className="grow"
                placeholder="Buscar por nombre o creador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-dots loading-md text-primary" />
          </div>
        ) : servers.length === 0 ? (
          <div className="text-center py-12 text-base-content/50">
            No hay servidores disponibles con ese filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((server) => (
              <div key={server._id} className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="card-title text-lg">{server.name}</h3>
                      <p className="text-sm text-base-content/50">
                        Creado por {server.createdByName} (@{server.createdByUsername})
                      </p>
                    </div>
                    {server.isDefault && <span className="badge badge-primary">Oficial</span>}
                  </div>

                  <div className="card-actions justify-end mt-2">
                    <button
                      onClick={() => handleJoin(server._id)}
                      disabled={joiningId === server._id}
                      className="btn btn-primary btn-sm"
                    >
                      {joiningId === server._id ? "Uniendo..." : "Unirme"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

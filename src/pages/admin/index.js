import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";

export default function AdminPage() {
  const [configs, setConfigs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [sandboxResult, setSandboxResult] = useState(null);
  const [dumps, setDumps] = useState([]);
  const [activeMapPoint, setActiveMapPoint] = useState(null);
  const [form, setForm] = useState({
    name: "",
    provider: "huggingface",
    endpoint_url: "",
    api_key_ref: "",
    default_model: "",
    active: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/model-configs")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setConfigs(data.configs || []);
      })
      .catch(() => {});

    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setAnalytics(data.analytics);
          const first = (data.analytics?.geoPoints || [])[0] || null;
          setActiveMapPoint(first);
        }
      })
      .catch(() => {});

    fetch("/api/datasets/dump")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setDumps(data.dumps || []);
      })
      .catch(() => {});
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/admin/model-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!data?.ok) throw new Error(data?.error || "Save failed.");
      setConfigs((prev) => [...prev, data.config]);
      setForm({ name: "", provider: "huggingface", endpoint_url: "", api_key_ref: "", default_model: "", active: true });
    } catch (err) {
      setError(err.message);
    }
  }

  async function runSandbox(test) {
    const response = await fetch("/api/admin/sandbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test }),
    });
    const data = await response.json();
    setSandboxResult(data);
  }

  return (
    <AppShell title="Admin Interface" subtitle="Analytics, maintenance, sandbox">
      <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <section className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Users" value={analytics?.usersTotal ?? 0} />
            <MetricCard label="Admins" value={analytics?.adminsTotal ?? 0} />
            <MetricCard label="Models" value={analytics?.modelsConfigured ?? 0} />
            <MetricCard label="Geo Buckets" value={Object.keys(analytics?.geolocations || {}).length} />
          </div>

          <div className="glm-card p-4">
            <h2 className="text-sm font-semibold">Geolocation Report</h2>
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(analytics?.geolocations || {}).map(([geo, count]) => (
                <div key={geo} className="flex items-center justify-between rounded-lg border border-[rgba(var(--glm-border),0.7)] px-2 py-1">
                  <span>{geo}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glm-card p-4">
            <h2 className="text-sm font-semibold">Realtime Geo Map</h2>
            {activeMapPoint ? (
              <>
                <p className="mt-1 text-xs text-[rgb(var(--glm-text-2))]">
                  {activeMapPoint.username} ({activeMapPoint.role}) at {activeMapPoint.lat}, {activeMapPoint.lng}
                </p>
                <p className="mt-1 text-xs text-[rgb(var(--glm-text-2))]">
                  {activeMapPoint.country || "unknown country"} / {activeMapPoint.region || "unknown region"} / {activeMapPoint.city || "unknown city"} | {activeMapPoint.networkProvider || "unknown network"} | {activeMapPoint.ipClass || "unknown ip class"} | {activeMapPoint.source || "unknown source"}
                </p>
                <iframe
                  title="Realtime location map"
                  className="mt-2 h-[260px] w-full rounded-lg border border-[rgba(var(--glm-border),0.8)]"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeMapPoint.lng - 0.03}%2C${activeMapPoint.lat - 0.03}%2C${activeMapPoint.lng + 0.03}%2C${activeMapPoint.lat + 0.03}&layer=mapnik&marker=${activeMapPoint.lat}%2C${activeMapPoint.lng}`}
                />
                <div className="mt-2 space-y-1 text-xs">
                  {(analytics?.geoPoints || []).map((point) => (
                    <button
                      key={`${point.userId}-${point.capturedAt}`}
                      type="button"
                      className="block w-full rounded-md border border-[rgba(var(--glm-border),0.7)] px-2 py-1 text-left hover:bg-black/5"
                      onClick={() => setActiveMapPoint(point)}
                    >
                      {point.username} | {point.lat}, {point.lng} | {point.country || "unknown"} | {point.networkProvider || "network?"} | {point.capturedAt || "unknown time"}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 text-xs text-[rgb(var(--glm-text-2))]">
                No realtime coordinates captured yet. Login from client with geolocation enabled.
              </p>
            )}
          </div>

          <div className="glm-card p-4">
            <h2 className="text-sm font-semibold">Sandbox</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {["auth", "messaging", "model_config", "security"].map((test) => (
                <button key={test} className="glm-btn" onClick={() => runSandbox(test)} type="button">
                  Test {test}
                </button>
              ))}
            </div>
            {sandboxResult ? (
              <pre className="mt-3 rounded-lg border border-[rgba(var(--glm-border),0.8)] p-2 text-xs overflow-auto">
                {JSON.stringify(sandboxResult, null, 2)}
              </pre>
            ) : null}
          </div>

          <div className="glm-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Encrypted Dataset Dumps</h2>
              <button
                className="glm-btn"
                onClick={async () => {
                  const response = await fetch("/api/datasets/dump", { method: "POST" });
                  const data = await response.json();
                  if (data?.ok) setDumps((prev) => [data.dump, ...prev]);
                }}
                type="button"
              >
                Create Dump
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {dumps.map((dump) => (
                <article key={dump.id} className="rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2 text-xs">
                  <p>ID: {dump.id}</p>
                  <p>Created: {dump.createdAt}</p>
                  <p>Ciphertext bytes: {dump.encrypted?.ciphertext?.length || 0}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="glm-card p-4">
            <h2 className="text-sm font-semibold">Model Provider Config</h2>
            <form className="mt-2 space-y-2" onSubmit={onSave}>
              <input className="glm-input w-full" placeholder="Display name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <input className="glm-input w-full" placeholder="Provider key (huggingface|groq|google)" value={form.provider} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))} />
              <input className="glm-input w-full" placeholder="Endpoint URL" value={form.endpoint_url} onChange={(e) => setForm((p) => ({ ...p, endpoint_url: e.target.value }))} />
              <input className="glm-input w-full" placeholder="API key env ref (HF_TOKEN, GROQ_API_KEY, GOOGLE_AI_STUDIO_API_KEY)" value={form.api_key_ref} onChange={(e) => setForm((p) => ({ ...p, api_key_ref: e.target.value }))} />
              <input className="glm-input w-full" placeholder="Default model id (e.g. Qwen/Qwen2.5-7B-Instruct)" value={form.default_model} onChange={(e) => setForm((p) => ({ ...p, default_model: e.target.value }))} />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
                Active
              </label>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              <button className="glm-btn glm-btn--primary w-full" type="submit">Save</button>
            </form>
          </div>

          <div className="glm-card p-4">
            <h2 className="text-sm font-semibold">Current Providers</h2>
            <div className="mt-2 space-y-2">
              {configs.map((cfg) => (
                <article key={cfg.id} className="rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2">
                  <p className="text-sm font-medium">{cfg.name}</p>
                  <p className="text-xs text-[rgb(var(--glm-text-2))]">{cfg.provider}</p>
                  <p className="text-xs text-[rgb(var(--glm-text-2))]">{cfg.endpoint_url}</p>
                  <p className="text-xs text-[rgb(var(--glm-text-2))]">{cfg.default_model || "default model not set"}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="glm-card p-3">
      <p className="text-xs text-[rgb(var(--glm-text-2))]">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

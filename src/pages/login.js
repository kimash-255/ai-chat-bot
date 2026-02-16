import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [clientGeo, setClientGeo] = useState(null);
  const [adminPhilosophyAnswer, setAdminPhilosophyAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (clientGeo !== null) return;
    if (!navigator.geolocation) {
      setClientGeo({ disabled: true });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setClientGeo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        setClientGeo({ disabled: true });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, [clientGeo]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, adminPhilosophyAnswer, clientGeo }),
      });
      const data = await response.json();
      if (!data?.ok) throw new Error(data?.error || "Invalid credentials.");
      const meResponse = await fetch("/api/auth/me", { credentials: "include" });
      const me = await meResponse.json();
      if (!me?.ok) throw new Error("Session was not established. Try again.");
      router.replace(data?.user?.role === "admin" ? "/admin/dashboard" : `/${data?.user?.id}/dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen glm-app flex items-center justify-center p-4">
      <form className="glm-card w-full max-w-md p-5 space-y-3" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">Sign In</h1>
        <input className="glm-input w-full" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="glm-input w-full" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input
          className="glm-input w-full"
          placeholder="Admin verification answer (only for admin accounts)"
          value={adminPhilosophyAnswer}
          onChange={(e) => setAdminPhilosophyAnswer(e.target.value)}
        />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button className="glm-btn glm-btn--primary w-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button className="glm-btn w-full" type="button" onClick={() => router.push("/register")}>
          Create Account
        </button>
        <button className="glm-btn w-full" type="button" onClick={() => router.push("/forgot-password")}>
          Forgot Password
        </button>
      </form>
    </div>
  );
}

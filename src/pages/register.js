import { useState } from "react";
import { useRouter } from "next/router";
import { INTEREST_OPTIONS } from "@/lib/interests";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [sacredNickname, setSacredNickname] = useState("");
  const [friendUsername, setFriendUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleInterest(value) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          displayName,
          bio,
          interests,
          sacredNickname,
          friendUsername,
        }),
      });
      const data = await response.json();
      if (!data?.ok) throw new Error(data?.error || "Registration failed.");
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen glm-app flex items-center justify-center p-4">
      <form className="glm-card w-full max-w-md p-5 space-y-3" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">Create Account</h1>

        <input className="glm-input w-full" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="glm-input w-full" type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="glm-input w-full" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <textarea className="glm-input w-full min-h-[88px]" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <div className="space-y-2">
          <p className="text-sm text-[rgb(var(--glm-text-2))]">Areas of interest</p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((item) => {
              const active = interests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={`rounded-md border px-2 py-1 text-sm ${
                    active
                      ? "border-[rgba(var(--glm-teal),0.9)] bg-[rgba(var(--glm-teal),0.16)]"
                      : "border-[rgba(var(--glm-border),0.8)]"
                  }`}
                  onClick={() => toggleInterest(item)}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
        <input className="glm-input w-full" placeholder="Sacred nickname" value={sacredNickname} onChange={(e) => setSacredNickname(e.target.value)} />
        <input className="glm-input w-full" placeholder="Friend username for recovery code" value={friendUsername} onChange={(e) => setFriendUsername(e.target.value)} />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button className="glm-btn glm-btn--primary w-full" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <button className="glm-btn w-full" type="button" onClick={() => router.push("/login")}>
          Back to Login
        </button>
      </form>
    </div>
  );
}

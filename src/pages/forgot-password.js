import { useState } from "react";
import { useRouter } from "next/router";
import { INTEREST_OPTIONS } from "@/lib/interests";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [recoveryId, setRecoveryId] = useState("");
  const [answer, setAnswer] = useState("");
  const [interests, setInterests] = useState([]);
  const [sacredNickname, setSacredNickname] = useState("");
  const [friendUsername, setFriendUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  function toggleInterest(value) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  }

  async function call(payload) {
    const response = await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  async function next(actionPayload, nextStep) {
    setError("");
    const data = await call(actionPayload);
    if (!data?.ok) {
      setError(data?.error || "Recovery step failed.");
      return;
    }
    if (data.recoveryId) setRecoveryId(data.recoveryId);
    setStep(nextStep);
  }

  return (
    <div className="min-h-screen glm-app flex items-center justify-center p-4">
      <div className="glm-card w-full max-w-lg p-5 space-y-3">
        <h1 className="text-xl font-semibold">Recover Account</h1>

        {step === 0 ? (
          <>
            <input className="glm-input w-full" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <button className="glm-btn glm-btn--primary w-full" onClick={() => next({ action: "begin", username }, 1)} type="button">
              Start Recovery
            </button>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className="text-sm text-[rgb(var(--glm-text-2))]">Human quiz: type `banana spaceship`</p>
            <input className="glm-input w-full" value={answer} onChange={(e) => setAnswer(e.target.value)} />
            <button className="glm-btn glm-btn--primary w-full" onClick={() => next({ action: "step1", recoveryId, answer }, 2)} type="button">
              Verify Step 1
            </button>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="text-sm text-[rgb(var(--glm-text-2))]">Select your saved areas of interest</p>
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
            <button className="glm-btn glm-btn--primary w-full" onClick={() => next({ action: "step2", recoveryId, interests }, 3)} type="button">
              Verify Step 2
            </button>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <input className="glm-input w-full" placeholder="Sacred nickname" value={sacredNickname} onChange={(e) => setSacredNickname(e.target.value)} />
            <button className="glm-btn glm-btn--primary w-full" onClick={() => next({ action: "step3", recoveryId, sacredNickname }, 4)} type="button">
              Verify Step 3
            </button>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <input className="glm-input w-full" placeholder="Friend username" value={friendUsername} onChange={(e) => setFriendUsername(e.target.value)} />
            <button className="glm-btn glm-btn--primary w-full" onClick={() => next({ action: "step4_request_code", recoveryId, friendUsername }, 5)} type="button">
              Ask Friend for Code
            </button>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <input className="glm-input w-full" placeholder="Friend code" value={code} onChange={(e) => setCode(e.target.value)} />
            <input className="glm-input w-full" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button
              className="glm-btn glm-btn--primary w-full"
              onClick={async () => {
                const data = await call({ action: "complete", recoveryId, code, newPassword });
                if (!data?.ok) {
                  setError(data?.error || "Recovery failed.");
                  return;
                }
                router.push("/login");
              }}
              type="button"
            >
              Reset Password
            </button>
          </>
        ) : null}

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button className="glm-btn w-full" type="button" onClick={() => router.push("/login")}>Back to Login</button>
      </div>
    </div>
  );
}

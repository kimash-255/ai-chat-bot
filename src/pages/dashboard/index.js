import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";

export default function UserDashboardPage() {
  const [friends, setFriends] = useState([]);
  const [friendUsername, setFriendUsername] = useState("");
  const [connectVia, setConnectVia] = useState("username");
  const [profile, setProfile] = useState({});
  const [inboxRequests, setInboxRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/friends")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setFriends(data.friends || []);
      })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setProfile(data.user?.profile || {});
      })
      .catch(() => {});

    fetch("/api/user/friend-requests")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok) return;
        setInboxRequests(data.inbox || []);
        setSentRequests(data.sent || []);
      })
      .catch(() => {});
  }, []);

  const inbox = useMemo(() => (Array.isArray(profile?.recoveryInbox) ? profile.recoveryInbox : []), [profile]);

  async function addFriendRequest() {
    setError("");
    const clean = friendUsername.trim().toLowerCase();
    if (!clean) return;
    const response = await fetch("/api/user/friend-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ via: connectVia, value: clean }),
    });
    const data = await response.json();
    if (!data?.ok) {
      setError(data?.error || "Failed to send friend request.");
      return;
    }
    setSentRequests((prev) => [data.request, ...prev]);
    setFriendUsername("");
  }

  async function removeFriend(username) {
    const response = await fetch("/api/user/friends", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendUsername: username }),
    });
    const data = await response.json();
    if (data?.ok) setFriends(data.friends || []);
  }

  async function respondToRequest(requestId, action) {
    const response = await fetch("/api/user/friend-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    const data = await response.json();
    if (!data?.ok) return;
    setInboxRequests((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: action } : item)));
    const friendsResponse = await fetch("/api/user/friends");
    const friendsData = await friendsResponse.json();
    if (friendsData?.ok) setFriends(friendsData.friends || []);
  }

  return (
    <AppShell title="Dashboard" subtitle="Friends and account activity">
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="glm-card p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(var(--glm-teal),0.2)] text-sm font-semibold">
              {(profile.displayName || "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{profile.displayName || "User"}</p>
              <p className="text-xs text-[rgb(var(--glm-text-2))]">NOS: {profile.nos || "n/a"}</p>
              <p className="text-xs text-[rgb(var(--glm-text-2))]">QR: friend://nos/{profile.nos || ""}</p>
            </div>
          </div>
          <h2 className="text-sm font-semibold">Friends</h2>
          <div className="mt-2 flex gap-2">
            <select className="glm-input w-[130px]" value={connectVia} onChange={(e) => setConnectVia(e.target.value)}>
              <option value="username">username</option>
              <option value="id">id</option>
              <option value="nos">nos</option>
              <option value="qr">qr</option>
            </select>
            <input
              className="glm-input w-full"
              placeholder="Enter username, NOS, or QR value"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
            />
            <button className="glm-btn glm-btn--primary" onClick={addFriendRequest} type="button">
              Connect
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
          <div className="mt-3 space-y-2">
            {friends.map((friend) => (
              <article key={friend} className="flex items-center justify-between rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2">
                <p className="text-sm">{friend}</p>
                <button className="glm-btn" onClick={() => removeFriend(friend)} type="button">
                  Remove
                </button>
              </article>
            ))}
            {!friends.length ? <p className="text-xs text-[rgb(var(--glm-text-2))]">No friends added yet.</p> : null}
          </div>
        </section>

        <section className="glm-card p-4">
          <h2 className="text-sm font-semibold">Friend Requests</h2>
          <div className="mt-2 space-y-2">
            {inboxRequests.map((item) => (
              <article key={item.id} className="rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2 text-sm">
                <p>{item.fromUsername} sent a request via {item.via}</p>
                <p className="text-xs text-[rgb(var(--glm-text-2))]">Status: {item.status}</p>
                {item.status === "pending" ? (
                  <div className="mt-2 flex gap-2">
                    <button className="glm-btn" type="button" onClick={() => respondToRequest(item.id, "accept")}>Accept</button>
                    <button className="glm-btn" type="button" onClick={() => respondToRequest(item.id, "reject")}>Reject</button>
                  </div>
                ) : null}
              </article>
            ))}
            {!inboxRequests.length ? <p className="text-xs text-[rgb(var(--glm-text-2))]">No incoming requests.</p> : null}
          </div>

          <h2 className="mt-4 text-sm font-semibold">Sent Requests</h2>
          <div className="mt-2 space-y-2">
            {sentRequests.map((item) => (
              <article key={item.id} className="rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2 text-sm">
                <p>To: {item.toUsername}</p>
                <p className="text-xs text-[rgb(var(--glm-text-2))]">Status: {item.status}</p>
              </article>
            ))}
            {!sentRequests.length ? <p className="text-xs text-[rgb(var(--glm-text-2))]">No sent requests.</p> : null}
          </div>

          <h2 className="mt-4 text-sm font-semibold">Recovery Inbox</h2>
          <p className="mt-1 text-xs text-[rgb(var(--glm-text-2))]">
            Codes sent to you as a recovery friend appear here.
          </p>
          <div className="mt-3 space-y-2">
            {inbox.map((item, index) => (
              <article key={`${item.from}-${item.issuedAt}-${index}`} className="rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2 text-sm">
                <p>From: {item.from}</p>
                <p>Code: {item.code}</p>
                <p className="text-xs text-[rgb(var(--glm-text-2))]">Issued: {item.issuedAt}</p>
              </article>
            ))}
            {!inbox.length ? <p className="text-xs text-[rgb(var(--glm-text-2))]">No recovery requests.</p> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

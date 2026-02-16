import crypto from "crypto";
import { getUserByUsername, saveUser } from "./store";
import { hashPassword } from "@/lib/auth-crypto";
import { normalizeInterests } from "@/lib/interests";

const recoverySessions = new Map();

function recoveryId() {
  return crypto.randomBytes(12).toString("base64url");
}

function recoveryCode() {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export async function beginRecovery(username) {
  const user = await getUserByUsername(String(username || "").trim().toLowerCase());
  if (!user) throw new Error("Account not found.");

  const id = recoveryId();
  recoverySessions.set(id, {
    username: user.username,
    selectedFriendUsername: "",
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    code: "",
    createdAt: Date.now(),
  });
  return { recoveryId: id };
}

export function verifyHumanQuiz(recoveryId, answer) {
  const session = recoverySessions.get(recoveryId);
  if (!session) throw new Error("Recovery session not found.");
  if (String(answer || "").trim().toLowerCase() !== "banana spaceship") {
    throw new Error("Human quiz failed.");
  }
  session.step1 = true;
}

export async function verifyInterests(recoveryId, interestsInput) {
  const session = recoverySessions.get(recoveryId);
  if (!session || !session.step1) throw new Error("Step order invalid.");
  const user = await getUserByUsername(session.username);
  const expected = normalizeInterests(user?.profile?.interests || []);
  const provided = normalizeInterests(interestsInput || []);
  const expectedKey = expected.slice().sort().join("|");
  const providedKey = provided.slice().sort().join("|");
  if (!expectedKey || providedKey !== expectedKey) {
    throw new Error("Interests verification failed.");
  }
  session.step2 = true;
}

export async function verifySacredNickname(recoveryId, nicknameInput) {
  const session = recoverySessions.get(recoveryId);
  if (!session || !session.step2) throw new Error("Step order invalid.");
  const user = await getUserByUsername(session.username);
  const expected = String(user?.profile?.sacredNickname || "").trim().toLowerCase();
  if (String(nicknameInput || "").trim().toLowerCase() !== expected) {
    throw new Error("Sacred nickname verification failed.");
  }
  session.step3 = true;
}

export async function requestFriendCode(recoveryId) {
  return requestFriendCodeToFriend(recoveryId, "");
}

export async function requestFriendCodeToFriend(recoveryId, friendUsernameInput) {
  const session = recoverySessions.get(recoveryId);
  if (!session || !session.step3) throw new Error("Step order invalid.");
  const user = await getUserByUsername(session.username);
  const configuredFriends = Array.isArray(user?.profile?.friends)
    ? user.profile.friends.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const legacyFriend = String(user?.profile?.friendUsername || "").trim().toLowerCase();
  if (legacyFriend && !configuredFriends.includes(legacyFriend)) configuredFriends.push(legacyFriend);
  const friendUsername = String(friendUsernameInput || "").trim().toLowerCase();
  if (!friendUsername) throw new Error("Friend username is required.");
  if (!configuredFriends.includes(friendUsername)) {
    throw new Error("Friend username is not in your approved friends list.");
  }
  const friend = await getUserByUsername(friendUsername);
  if (!friend) throw new Error("Friend account not found.");
  session.selectedFriendUsername = friendUsername;

  session.code = recoveryCode();
  session.step4 = true;

  // In production this should be delivered through a secure out-of-band channel.
  // For internal flow, it is stored in friend profile inbox for retrieval.
  await saveUser({
    ...friend,
    profile: {
      ...(friend.profile || {}),
      recoveryInbox: [
        ...(friend.profile?.recoveryInbox || []),
        {
          from: session.username,
          to: friendUsername,
          code: session.code,
          issuedAt: new Date().toISOString(),
        },
      ],
    },
  });
}

export async function finalizeRecovery(recoveryId, code, newPassword) {
  const session = recoverySessions.get(recoveryId);
  if (!session || !session.step4) throw new Error("Step order invalid.");
  if (String(code || "").trim() !== session.code) throw new Error("Invalid friend verification code.");
  if (String(newPassword || "").length < 8) throw new Error("Password must be at least 8 characters.");

  const user = await getUserByUsername(session.username);
  await saveUser({
    ...user,
    password_hash: hashPassword(newPassword),
  });
  recoverySessions.delete(recoveryId);
}

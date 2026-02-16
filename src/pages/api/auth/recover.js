import {
  beginRecovery,
  finalizeRecovery,
  requestFriendCodeToFriend,
  verifyHumanQuiz,
  verifyInterests,
  verifySacredNickname,
} from "@/core/auth/recovery-store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { action, username, recoveryId, answer, interests, sacredNickname, friendUsername, code, newPassword } = req.body || {};

    if (action === "begin") {
      const session = await beginRecovery(username);
      return res.status(200).json({ ok: true, ...session, quiz: "Type exactly: banana spaceship" });
    }
    if (action === "step1") {
      verifyHumanQuiz(recoveryId, answer);
      return res.status(200).json({ ok: true });
    }
    if (action === "step2") {
      await verifyInterests(recoveryId, interests);
      return res.status(200).json({ ok: true });
    }
    if (action === "step3") {
      await verifySacredNickname(recoveryId, sacredNickname);
      return res.status(200).json({ ok: true });
    }
    if (action === "step4_request_code") {
      await requestFriendCodeToFriend(recoveryId, friendUsername);
      return res.status(200).json({ ok: true, message: "Code sent to friend account inbox." });
    }
    if (action === "complete") {
      await finalizeRecovery(recoveryId, code, newPassword);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error?.message || "Recovery step failed." });
  }
}

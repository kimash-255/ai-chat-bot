import { callHuggingFaceModel } from "@/core/models/huggingface";
import { getActiveModelConfigs } from "@/core/models/config-store";
import { requireAuthenticatedUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { input, messages, task = "text-generation", model = "auto", tags = [] } = req.body || {};
    const configs = await getActiveModelConfigs();
    const config = configs.find((item) => item.provider === "huggingface") || configs[0];
    if (!config) {
      return res.status(400).json({ ok: false, error: "No active Hugging Face provider config found." });
    }
    const normalizedMessages = Array.isArray(messages) && messages.length
      ? messages
      : [{ role: "user", content: String(input || "") }];

    const result = await callHuggingFaceModel({
      model,
      providerConfig: config,
      messages: normalizedMessages,
      context: { task: String(task || "text-generation"), tags },
    });

    return res.status(200).json({ ok: true, result });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error?.message || "Hugging Face request failed." });
  }
}

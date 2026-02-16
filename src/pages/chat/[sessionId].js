import { useRouter } from "next/router";
import { ChatPageView } from "./index";

export default function SessionPage() {
  const router = useRouter();
  const sessionId = String(router.query.sessionId || "");

  if (!sessionId) return null;
  return <ChatPageView initialSessionId={sessionId} />;
}

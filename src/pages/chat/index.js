import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Drawer from "@/components/ui/Drawer";
import AppShell from "@/components/shell/AppShell";
import DirectMessagesPanel from "@/components/shell/DirectMessagesPanel";
import NotificationsPanel from "@/components/shell/NotificationsPanel";
import { BellIcon, IconButton, MessageIcon } from "@/components/ui/Icons";

const ChatWorkspace = dynamic(() => import("@/components/chat/ChatWorkspace"), {
  ssr: false,
});

function clipText(text, max = 52) {
  const safe = String(text || "").trim().replace(/\s+/g, " ");
  if (!safe) return "";
  return safe.length > max ? `${safe.slice(0, max - 1)}...` : safe;
}

function nowSessionId() {
  return `s-${Date.now()}`;
}

export default function ChatHomePage() {
  return <ChatPageView />;
}

export function ChatPageView({ initialSessionId }) {
  const router = useRouter();
  const initializedRef = useRef(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(initialSessionId || "");
  const [messages, setMessages] = useState([]);
  const [activeMessageId, setActiveMessageId] = useState("");
  const [tags, setTags] = useState(["chat"]);
  const [model, setModel] = useState("auto");
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSessionPane, setShowSessionPane] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  const [showComposer, setShowComposer] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [dmDraft, setDmDraft] = useState("");
  const [uplinks, setUplinks] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedUplinkIds, setSelectedUplinkIds] = useState([]);
  const [viewOnceByUplinkId, setViewOnceByUplinkId] = useState({});
  const [modelResponses, setModelResponses] = useState([]);
  const [recommendedModel, setRecommendedModel] = useState("auto");
  const [toolTraces, setToolTraces] = useState([]);
  const [retrievalSources, setRetrievalSources] = useState([]);
  const [modelPool, setModelPool] = useState([]);

  function scopedPath(path) {
    const normalized = String(path || "").startsWith("/") ? String(path) : `/${path}`;
    const clean = String(router.asPath || "").split("?")[0].split("#")[0];
    if (clean === "/admin" || clean.startsWith("/admin/")) {
      return normalized.startsWith("/admin") ? normalized : `/admin${normalized}`;
    }
    const match = clean.match(/^\/([^/]+)\/(dashboard|welcome|docs|chat|datasets|tools|models|tags|prompts|settings)(\/.*)?$/);
    if (match?.[1]) return normalized.startsWith(`/${match[1]}`) ? normalized : `/${match[1]}${normalized}`;
    return normalized;
  }

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0],
    [activeSessionId, sessions]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (typeof window !== "undefined" && window.innerWidth < 1200) {
      setShowSidebar(false);
      setShowSessionPane(false);
      setShowInspector(false);
    }
  }, []);

  useEffect(() => {
    if (showComposer) {
      setShowSessionPane(false);
      setShowInspector(false);
    }
  }, [showComposer]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setCurrentUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/models/configs")
      .then((res) => res.json())
      .then((data) => {
        const pool = (data?.configs || []).map((item) => item.model).filter(Boolean);
        setModelPool(pool);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadSessions() {
      try {
        const response = await fetch("/api/chat/sessions");
        const data = await response.json();
        if (!mounted || !data?.ok) return;
        const loaded = Array.isArray(data.sessions) ? data.sessions : [];
        setSessions(loaded);
        setActiveSessionId((prev) => prev || initialSessionId || loaded[0]?.id || "");
      } catch {
        // keep empty when unavailable
      }
    }
    loadSessions();
    return () => {
      mounted = false;
    };
  }, [initialSessionId]);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      setActiveMessageId("");
      return;
    }

    let mounted = true;
    async function loadSessionMessages() {
      try {
        const response = await fetch(`/api/chat/sessions/${encodeURIComponent(activeSessionId)}`);
        const data = await response.json();
        if (!mounted || !data?.ok) return;
        const loadedMessages = Array.isArray(data.messages) ? data.messages : [];
        setMessages(loadedMessages);
        setActiveMessageId(loadedMessages[loadedMessages.length - 1]?.id || "");
      } catch {
        // keep current in-memory state
      }
    }

    loadSessionMessages();
    return () => {
      mounted = false;
    };
  }, [activeSessionId]);

  useEffect(() => {
    let mounted = true;

    async function loadThreads() {
      try {
        const response = await fetch("/api/user/friends");
        const data = await response.json();
        if (!mounted || !data?.ok) return;

        const loadedThreads = (data.friends || []).map((friendUsername) => ({
          id: friendUsername,
          user: friendUsername,
          messages: [],
        }));

        if (loadedThreads.length) {
          setThreads(loadedThreads);
          setActiveThreadId((prev) => prev || loadedThreads[0].id);
        }
      } catch {
        // keep local fallback
      }
    }

    loadThreads();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeThreadId) return;
    let mounted = true;

    async function loadThreadMessages() {
      try {
        const response = await fetch(`/api/messages/${activeThreadId}`);
        const data = await response.json();
        if (!mounted || !data?.ok) return;

        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === activeThreadId
              ? {
                  ...thread,
                  messages: data.messages.map((msg) => ({
                    id: msg.id,
                    from: msg.senderId === currentUserId ? "Me" : msg.senderId,
                    text: msg.text,
                    attachments: msg.attachments || [],
                  })),
                }
              : thread
          )
        );
      } catch {
        // ignore
      }
    }

    loadThreadMessages();
    return () => {
      mounted = false;
    };
  }, [activeThreadId, currentUserId]);

  function onNewChat() {
    const id = nowSessionId();
    const next = { id, title: "New Chat", preview: "" };
    setSessions((prev) => [next, ...prev]);
    setActiveSessionId(id);
    setMessages([]);
    setActiveMessageId("");
  }

  function onSendDirectMessage(threadId) {
    const cleanDraft = dmDraft.trim();
    if (!threadId || !cleanDraft) return;
    const attachmentSelections = selectedUplinkIds.map((uplinkId) => ({
      uplinkId,
      viewOnce: Boolean(viewOnceByUplinkId[uplinkId]),
    }));

    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        text: cleanDraft,
        tags: ["chat"],
        model: "direct-message",
        attachmentSelections,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok) return;
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === data.threadId
              ? {
                  ...thread,
                  messages: data.messages.map((msg) => ({
                    id: msg.id,
                    from: msg.senderId === currentUserId ? "Me" : msg.senderId,
                    text: msg.text,
                    attachments: msg.attachments || [],
                  })),
                }
              : thread
          )
        );
        setDmDraft("");
        setSelectedUplinkIds([]);
        setViewOnceByUplinkId({});
      })
      .catch(() => {
        // keep local fallback if API fails
      });
  }

  async function onUploadDmFiles(fileList) {
    const files = fileList ? [...fileList] : [];
    if (!files.length) return;

    for (const file of files) {
      const dataUrl = await fileToDataUrl(file);
      const response = await fetch("/api/uplink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size || 0,
          tags: ["chat_upload"],
          dataUrl,
        }),
      });
      const payload = await response.json();
      if (!payload?.ok) continue;
      setUplinks((prev) => [payload.uplink, ...prev]);
    }
  }

  function toggleUplinkSelection(uplinkId) {
    setSelectedUplinkIds((prev) =>
      prev.includes(uplinkId) ? prev.filter((id) => id !== uplinkId) : [...prev, uplinkId]
    );
  }

  function toggleViewOnceUplink(uplinkId) {
    setViewOnceByUplinkId((prev) => ({ ...prev, [uplinkId]: !prev[uplinkId] }));
  }

  async function onOpenDmAttachment(messageId, attachment) {
    if (!activeThreadId || !attachment?.uplinkId) return;
    try {
      const params = new URLSearchParams({
        messageId,
        uplinkId: attachment.uplinkId,
      });
      const response = await fetch(`/api/messages/${activeThreadId}?${params.toString()}`);
      const data = await response.json();
      if (!data?.ok) return;

      const dataUrl = data?.attachment?.dataUrl;
      if (!dataUrl) return;

      window.open(dataUrl, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  }

  async function onSend(payload) {
    const resolvedSessionId = activeSessionId || nowSessionId();
    if (!activeSessionId) {
      setActiveSessionId(resolvedSessionId);
      setSessions((prev) => [{ id: resolvedSessionId, title: "New Chat", preview: "" }, ...prev]);
    }

    const userMessage = {
      id: `m-u-${Date.now()}`,
      role: "user",
      content: payload.content,
      createdAt: new Date().toISOString(),
      tags: payload.tags,
      model: payload.model,
      usage: { totalTokens: 0 },
    };

    setMessages((prev) => [...prev, userMessage]);
    setActiveMessageId(userMessage.id);
    setIsTyping(true);
    setToolTraces([]);
    setRetrievalSources([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: resolvedSessionId,
          message: payload.content,
          tags: payload.tags,
          model: payload.model,
          history: messages,
        }),
      });
      const data = await response.json();

      if (!data?.ok) {
        throw new Error(data?.error || "Chat API failed.");
      }

      const assistantMessage = {
        id: `m-a-${Date.now()}`,
        role: "assistant",
        content: data.reply.content,
        createdAt: data.reply.createdAt || new Date().toISOString(),
        tags: payload.tags,
        model: data.reply.model || payload.model,
        provider: data.reply.provider || "unknown",
        usage: data.reply.usage || { totalTokens: 0 },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setActiveMessageId(assistantMessage.id);
      setModelResponses([{ model: assistantMessage.model || "auto", content: assistantMessage.content, rank: 1 }]);
      setRecommendedModel(assistantMessage.model || "auto");
      setSessions((prev) =>
        prev.map((session) =>
          session.id === resolvedSessionId
            ? {
                ...session,
                title: session.title || clipText(payload.content, 24) || "New Chat",
                preview: clipText(assistantMessage.content, 56),
              }
            : session
        )
      );
    } catch {
      setModelResponses([]);
      setRecommendedModel("auto");
    } finally {
      setIsTyping(false);
    }
  }

  function toggleComposerPanel() {
    setShowComposer((prev) => {
      const next = !prev;
      if (next) {
        setShowSessionPane(false);
        setShowInspector(false);
      }
      return next;
    });
  }

  function toggleSessionPane() {
    setShowSessionPane((prev) => {
      const next = !prev;
      if (next) setShowInspector(false);
      return next;
    });
  }

  function toggleBestResponsesPane() {
    setShowInspector((prev) => {
      const next = !prev;
      if (next) setShowSessionPane(false);
      return next;
    });
  }

  return (
    <AppShell
      title="Chat"
      subtitle={activeSession?.title || "Session"}
      showSidebar={showSidebar}
      onToggleSidebar={() => setShowSidebar((v) => !v)}
      sessions={sessions}
      activeSessionId={activeSessionId}
      onSelectSession={(id) => {
        setActiveSessionId(id);
        router.push(scopedPath(`/chat/${id}`));
      }}
      onNewChat={onNewChat}
      topbarRight={
        <div className="flex items-center gap-2">
          <IconButton title="Notifications" onClick={() => setNotificationsOpen(true)} className="relative">
            <BellIcon />
            {notifications.filter((n) => !n.read).length > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[rgb(var(--glm-coral))] px-1 text-[10px] text-white">
                {notifications.filter((n) => !n.read).length}
              </span>
            ) : null}
          </IconButton>
          <IconButton title="Direct Messages" onClick={() => setDmOpen(true)}>
            <MessageIcon />
          </IconButton>
        </div>
      }
    >
      <ChatWorkspace
        sessions={sessions}
        activeSessionId={activeSessionId}
        messages={messages}
        activeMessageId={activeMessageId}
        tags={tags}
        model={model}
        attachments={attachments}
        isTyping={isTyping}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          router.push(scopedPath(`/chat/${id}`));
        }}
        onSelectMessage={setActiveMessageId}
        onChangeTags={setTags}
        onChangeModel={setModel}
        onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((x) => (x.id || x.name) !== id))}
        onSend={onSend}
        showSessionPane={showSessionPane}
        showInspector={showInspector}
        showComposer={showComposer}
        onToggleSessionPane={toggleSessionPane}
        onToggleInspector={toggleBestResponsesPane}
        onToggleComposer={toggleComposerPanel}
        modelResponses={modelResponses}
        recommendedModel={recommendedModel}
        traces={toolTraces}
        sources={retrievalSources}
        modelOptions={modelPool}
        onRetry={() => {
          const lastUser = [...messages].reverse().find((m) => m.role === "user");
          if (!lastUser) return;
          onSend({ content: lastUser.content, tags, model, attachments });
        }}
      />

      <Drawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)}>
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setNotificationsOpen(false)}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
          }
        />
      </Drawer>

      <Drawer open={dmOpen} onClose={() => setDmOpen(false)}>
        <DirectMessagesPanel
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          draft={dmDraft}
          onDraftChange={setDmDraft}
          onSend={onSendDirectMessage}
          onClose={() => setDmOpen(false)}
          uplinks={uplinks}
          selectedUplinkIds={selectedUplinkIds}
          viewOnceByUplinkId={viewOnceByUplinkId}
          onUploadFiles={onUploadDmFiles}
          onToggleUplinkSelection={toggleUplinkSelection}
          onToggleViewOnce={toggleViewOnceUplink}
          onOpenAttachment={onOpenDmAttachment}
        />
      </Drawer>
    </AppShell>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

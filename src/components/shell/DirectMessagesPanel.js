import { useMemo, useRef } from "react";
import { getEmojiSet } from "@/lib/emoji-library";
import { CloseIcon, IconButton } from "../ui/Icons";

export default function DirectMessagesPanel({
  threads = [],
  activeThreadId,
  draft = "",
  onSelectThread,
  onDraftChange,
  onSend,
  onClose,
  uplinks = [],
  selectedUplinkIds = [],
  viewOnceByUplinkId = {},
  onUploadFiles,
  onToggleUplinkSelection,
  onToggleViewOnce,
  onOpenAttachment,
}) {
  const emojis = getEmojiSet("common");
  const fileInputRef = useRef(null);
  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) || threads[0],
    [activeThreadId, threads]
  );

  function addEmoji(emoji) {
    onDraftChange?.(`${draft}${emoji}`);
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Messages</h3>
        <IconButton title="Close Messages" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className="grid h-full min-h-0 grid-cols-[180px_1fr] gap-3">
      <div className="space-y-1 min-h-0 overflow-auto glm-scroll pr-1">
        {threads.map((thread) => (
          <button
            key={thread.id}
            className={`w-full rounded-lg border px-2 py-2 text-left text-sm ${
              thread.id === activeThread?.id
                ? "border-[rgba(var(--glm-purple),0.8)] bg-[rgba(var(--glm-purple),0.1)]"
                : "border-[rgba(var(--glm-border),0.8)]"
            }`}
            onClick={() => onSelectThread?.(thread.id)}
            type="button"
          >
            {thread.user}
          </button>
        ))}
      </div>

      <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-3 overflow-hidden">
        <div className="min-h-0 overflow-auto glm-scroll rounded-xl border border-[rgba(var(--glm-border),0.85)] p-2">
          {!activeThread?.messages?.length ? (
            <p className="text-sm text-[rgb(var(--glm-text-2))]">No messages yet.</p>
          ) : (
            activeThread.messages.map((message) => (
              <div key={message.id} className="mb-2 rounded-lg border border-[rgba(var(--glm-border),0.7)] p-2 text-sm">
                <p className="text-xs text-[rgb(var(--glm-text-2))]">{message.from}</p>
                <p>{message.text}</p>
                {message.attachments?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <button
                        key={`${message.id}-${attachment.uplinkId}`}
                        className="rounded-md border border-[rgba(var(--glm-border),0.7)] px-2 py-1 text-xs"
                        onClick={() => onOpenAttachment?.(message.id, attachment)}
                        type="button"
                      >
                        {attachment.fileName}
                        {attachment.viewOnce ? " (view-once)" : ""}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 overflow-auto glm-scroll">
          <div className="flex items-center gap-2">
            <button
              className="glm-btn glm-btn--ghost px-3 py-1.5"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Attach
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,text/*"
              className="hidden"
              onChange={(e) => {
                onUploadFiles?.(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {uplinks.length ? (
            <div className="max-h-[90px] overflow-auto glm-scroll space-y-1 rounded-lg border border-[rgba(var(--glm-border),0.7)] p-2">
              {uplinks.map((uplink) => {
                const selected = selectedUplinkIds.includes(uplink.uplinkId);
                const viewOnce = Boolean(viewOnceByUplinkId[uplink.uplinkId]);
                return (
                  <div key={uplink.uplinkId} className="flex items-center justify-between gap-2 text-xs">
                    <button
                      className={`rounded-md px-2 py-1 ${selected ? "bg-[rgba(var(--glm-teal),0.18)]" : "bg-[rgba(var(--glm-text),0.06)]"}`}
                      onClick={() => onToggleUplinkSelection?.(uplink.uplinkId)}
                      type="button"
                    >
                      {uplink.fileName}
                    </button>
                    {selected ? (
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={viewOnce}
                          onChange={() => onToggleViewOnce?.(uplink.uplinkId)}
                        />
                        view-once
                      </label>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          <textarea
            className="glm-input min-h-[80px] w-full"
            value={draft}
            onChange={(e) => onDraftChange?.(e.target.value)}
            placeholder={`Message ${activeThread?.user || "user"}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend?.(activeThread?.id);
              }
            }}
          />
          <div className="flex flex-wrap gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                className="rounded-md border border-[rgba(var(--glm-border),0.8)] px-2 py-1 text-sm"
                type="button"
                onClick={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            className="glm-btn glm-btn--primary"
            onClick={() => onSend?.(activeThread?.id)}
            type="button"
          >
            Send Message
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

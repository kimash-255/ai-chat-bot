import { useMemo } from "react";
import InspectorPanel from "../inspector/InspectorPanel";
import SplitPane from "../shell/SplitPane";
import {
  ChevronDoubleDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleUpIcon,
  IconButton,
} from "../ui/Icons";
import Composer from "./Composer";
import MessageList from "./MessageList";
import SessionList from "./SessionList";
import TypingIndicator from "./TypingIndicator";

export default function ChatWorkspace({
  sessions = [],
  activeSessionId,
  messages = [],
  activeMessageId,
  tags = ["chat"],
  model = "auto",
  attachments = [],
  isTyping,
  onSelectSession,
  onSelectMessage,
  onChangeTags,
  onChangeModel,
  onRemoveAttachment,
  onSend,
  showSessionPane = true,
  showInspector = true,
  showComposer = true,
  onToggleSessionPane,
  onToggleInspector,
  onToggleComposer,
  modelResponses = [],
  recommendedModel = "auto",
  traces = [],
  sources = [],
  onRetry,
  modelOptions = [],
}) {
  const selectedMessage = useMemo(
    () => messages.find((msg) => msg.id === activeMessageId) || messages[messages.length - 1],
    [activeMessageId, messages]
  );

  return (
    <SplitPane
      storageKey="chat_workspace"
      showLeft={showSessionPane}
      showRight={showInspector}
      left={
        <div className="h-full min-h-0 rounded-2xl border border-[rgba(var(--glm-border),0.9)] bg-[rgb(var(--glm-surface))] grid grid-rows-[auto_1fr] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[rgba(var(--glm-border),0.75)] px-3 py-2">
            <p className="text-xs font-semibold text-[rgb(var(--glm-text-2))]">Recent Sessions</p>
            <IconButton title="Close Sessions" onClick={onToggleSessionPane}>
              <ChevronDoubleLeftIcon />
            </IconButton>
          </div>
          <SessionList sessions={sessions} activeSessionId={activeSessionId} onSelectSession={onSelectSession} />
        </div>
      }
      center={
        <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-2 overflow-hidden">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[rgba(var(--glm-border),0.85)] bg-[rgba(var(--glm-surface),0.8)] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              {!showSessionPane ? (
                <IconButton title="Open Sessions" onClick={onToggleSessionPane}>
                  <ChevronDoubleRightIcon />
                </IconButton>
              ) : null}
              {!showInspector ? (
                <IconButton title="Open Best Responses" onClick={onToggleInspector}>
                  <ChevronDoubleUpIcon />
                </IconButton>
              ) : null}
              <p className="truncate text-sm font-medium text-[rgb(var(--glm-text))]">
                {sessions.find((item) => item.id === activeSessionId)?.title || "Conversation"}
              </p>
            </div>
            <div className="text-xs text-[rgb(var(--glm-text-2))]">
              {messages.length} messages
            </div>
          </div>

          <div className="min-h-0 rounded-2xl border border-[rgba(var(--glm-border),0.9)] bg-[rgb(var(--glm-surface))] overflow-hidden">
            <MessageList messages={messages} activeMessageId={activeMessageId} onSelectMessage={onSelectMessage} />
            <TypingIndicator visible={isTyping} />
          </div>

          {showComposer ? (
            <div className="space-y-2">
              <div className="flex justify-end">
                <IconButton title="Close Composer" onClick={onToggleComposer}>
                  <ChevronDoubleDownIcon />
                </IconButton>
              </div>
              <div className="sticky bottom-0">
                <Composer
                  tags={tags}
                  model={model}
                  modelOptions={modelOptions}
                  attachments={attachments}
                  onChangeTags={onChangeTags}
                  onChangeModel={onChangeModel}
                  onRemoveAttachment={onRemoveAttachment}
                  onSubmit={onSend}
                  disabled={isTyping}
                  onRetry={onRetry}
                  traces={traces}
                  sources={sources}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <IconButton title="Open Composer" onClick={onToggleComposer}>
                <ChevronDoubleUpIcon />
              </IconButton>
            </div>
          )}
        </div>
      }
      right={
        <div className="h-full min-h-0 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between rounded-xl border border-[rgba(var(--glm-border),0.85)] bg-[rgba(var(--glm-surface),0.8)] px-3 py-2">
            <p className="text-xs font-semibold text-[rgb(var(--glm-text-2))]">Best Response</p>
            <IconButton title="Close Best Responses" onClick={onToggleInspector}>
              <ChevronDoubleDownIcon />
            </IconButton>
          </div>
          <InspectorPanel
            message={selectedMessage}
            responses={modelResponses}
            recommendedModel={recommendedModel}
          />
        </div>
      }
    />
  );
}

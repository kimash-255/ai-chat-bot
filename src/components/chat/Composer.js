import { useState } from "react";
import { getEmojiSet } from "@/lib/emoji-library";
import RetrievalViewer from "../inspector/RetrievalViewer";
import RetryControls from "../inspector/RetryControls";
import ToolTraceViewer from "../inspector/ToolTraceViewer";
import { ChevronDownIcon, ChevronUpIcon } from "../ui/Icons";
import AttachmentTray from "./AttachmentTray";
import ModelPicker from "./ModelPicker";
import TagSelector from "./TagSelector";

export default function Composer({
  tags = ["chat"],
  model = "auto",
  attachments = [],
  disabled,
  onChangeTags,
  onChangeModel,
  onRemoveAttachment,
  onSubmit,
  onRetry,
  traces = [],
  sources = [],
  modelOptions = [],
}) {
  const emojis = getEmojiSet("common");
  const [text, setText] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  function handleSubmit() {
    const content = text.trim();
    if (!content || disabled) return;

    onSubmit?.({ content, tags, model, attachments });
    setText("");
  }

  function addEmoji(emoji) {
    setText((prev) => `${prev}${emoji}`);
  }

  return (
    <div className="rounded-2xl border border-[rgba(var(--glm-border),0.9)] bg-[rgb(var(--glm-surface))] p-2 shadow-[0_10px_28px_rgba(0,0,0,0.10)]">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button className="glm-btn glm-btn--ghost px-2.5 py-1 text-xs" onClick={() => setToolsOpen((v) => !v)} type="button">
          Tools {toolsOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </button>
        <button
          className="glm-btn glm-btn--ghost px-2.5 py-1 text-xs"
          onClick={() => setSourcesOpen((v) => !v)}
          type="button"
        >
          Sources {sourcesOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </button>
        <RetryControls onRetry={onRetry} />
      </div>

      {toolsOpen ? (
        <div className="mb-2 rounded-lg border border-[rgba(var(--glm-border),0.7)] p-2">
          <ToolTraceViewer traces={traces} />
        </div>
      ) : null}

      {sourcesOpen ? (
        <div className="mb-2 rounded-lg border border-[rgba(var(--glm-border),0.7)] p-2">
          <RetrievalViewer sources={sources} />
        </div>
      ) : null}

      <AttachmentTray attachments={attachments} onRemove={onRemoveAttachment} />

      <div className="rounded-xl border border-[rgba(var(--glm-border),0.85)] bg-[rgba(var(--glm-surface-2),0.5)] p-2">
        <textarea
          className="glm-input min-h-[74px] w-full resize-y rounded-xl border-none bg-transparent p-2 shadow-none focus:shadow-none"
          placeholder="Message..."
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isComposing) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                className="rounded-md border border-[rgba(var(--glm-border),0.8)] px-2 py-1 text-sm hover:bg-black/5"
                type="button"
                onClick={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button className="glm-btn glm-btn--primary min-w-[92px]" disabled={disabled} onClick={handleSubmit} type="button">
            Send
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <ModelPicker value={model} options={modelOptions} onChange={onChangeModel} />
        <p className="text-xs text-[rgb(var(--glm-text-2))]">Enter to send, Shift+Enter for new line</p>
      </div>

      <div className="mt-2 border-t border-[rgba(var(--glm-border),0.75)] pt-2">
        <TagSelector selected={tags} onChange={onChangeTags} />
      </div>
    </div>
  );
}

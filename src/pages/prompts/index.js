import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import PromptEditor from "@/components/prompts/PromptEditor";
import PromptTemplateList from "@/components/prompts/PromptTemplateList";
import RefinePromptDiff from "@/components/prompts/RefinePromptDiff";
import SystemInstructionEditor from "@/components/prompts/SystemInstructionEditor";

const TEMPLATES = [
  { id: "p-1", name: "Refiner", description: "Refine user prompts" },
  { id: "p-2", name: "Summarizer", description: "Summarize long context" },
];

export default function PromptsPage() {
  const [prompt, setPrompt] = useState("Write a concise summary.");
  const [system, setSystem] = useState("You are a concise assistant.");

  return (
    <AppShell title="Prompts" subtitle="Prompt studio">
      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <div className="glm-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Templates</h3>
          <PromptTemplateList templates={TEMPLATES} onPick={() => {}} />
        </div>

        <div className="space-y-3">
          <div className="glm-card p-3">
            <h3 className="mb-2 text-sm font-semibold">Prompt</h3>
            <PromptEditor value={prompt} onChange={setPrompt} />
          </div>

          <div className="glm-card p-3">
            <h3 className="mb-2 text-sm font-semibold">System</h3>
            <SystemInstructionEditor value={system} onChange={setSystem} />
          </div>

          <div className="glm-card p-3">
            <h3 className="mb-2 text-sm font-semibold">Diff</h3>
            <RefinePromptDiff original={prompt} refined={`${prompt} (refined)`} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

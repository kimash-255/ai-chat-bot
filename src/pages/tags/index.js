import AppShell from "@/components/shell/AppShell";
import TagEditor from "@/components/tags/TagEditor";
import TagList from "@/components/tags/TagList";
import TagRulesEditor from "@/components/tags/TagRulesEditor";

export default function TagsPage() {
  const tags = [];
  const rules = [];

  return (
    <AppShell title="Tags" subtitle="Management and rules">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="glm-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Tag List</h3>
          <TagList tags={tags} />
        </div>
        <div className="glm-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Tag Editor</h3>
          <TagEditor onSave={() => {}} />
        </div>
        <div className="md:col-span-2 glm-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Rules</h3>
          <TagRulesEditor rules={rules} />
        </div>
      </div>
    </AppShell>
  );
}

import AppShell from "@/components/shell/AppShell";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="User preferences">
      <div className="glm-card p-4">
        <p className="text-sm">Settings view is page-owned and API-ready.</p>
      </div>
    </AppShell>
  );
}

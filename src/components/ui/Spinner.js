export default function Spinner({ label = "Loading" }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-[rgb(var(--glm-text-2))]">
      <span className="h-4 w-4 rounded-full border-2 border-[rgb(var(--glm-border))] border-t-[rgb(var(--glm-purple))] animate-spin" />
      {label}
    </span>
  );
}

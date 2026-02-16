export default function PromptEditor({ value = "", onChange }) {
  return (
    <textarea
      className="glm-input min-h-[240px] w-full"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Write prompt"
    />
  );
}

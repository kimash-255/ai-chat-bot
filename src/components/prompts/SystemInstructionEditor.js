export default function SystemInstructionEditor({ value = "", onChange }) {
  return (
    <textarea
      className="glm-input min-h-[160px] w-full"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="System instructions"
    />
  );
}

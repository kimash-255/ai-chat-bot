import ToolCard from "./ToolCard";

export default function ToolList({ tools = [], onOpen }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onOpen={onOpen} />
      ))}
    </div>
  );
}

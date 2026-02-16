import ModelCard from "./ModelCard";

export default function ModelList({ models = [] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {models.map((model) => (
        <ModelCard key={model.name} model={model} />
      ))}
    </div>
  );
}

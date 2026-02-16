import DatasetCard from "./DatasetCard";

export default function DatasetGrid({ datasets = [], onOpen }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {datasets.map((dataset) => (
        <DatasetCard key={dataset.id} dataset={dataset} onOpen={onOpen} />
      ))}
    </div>
  );
}

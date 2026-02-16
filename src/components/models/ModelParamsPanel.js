export default function ModelParamsPanel({ params = {} }) {
  return (
    <div className="glm-card p-3 text-sm">
      <div>Temperature: {params.temperature ?? 0.2}</div>
      <div>Max Tokens: {params.maxTokens ?? 500}</div>
    </div>
  );
}

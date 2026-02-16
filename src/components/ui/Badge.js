export default function Badge({ children, className = "" }) {
  return <span className={`glm-tag ${className}`.trim()}>{children}</span>;
}

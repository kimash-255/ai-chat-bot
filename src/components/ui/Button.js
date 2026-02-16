export default function Button({
  children,
  variant = "default",
  type = "button",
  className = "",
  ...props
}) {
  const variantClass =
    variant === "primary"
      ? "glm-btn glm-btn--primary"
      : variant === "ghost"
        ? "glm-btn glm-btn--ghost"
        : "glm-btn";

  return (
    <button type={type} className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

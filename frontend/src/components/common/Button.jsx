const variants = {
  primary: "bg-teal-700 text-white hover:bg-teal-600 shadow-sm",
  dark: "bg-ink-900 text-white hover:bg-ink-700",
  secondary: "bg-surface text-ink-900 ring-1 ring-inset ring-line hover:bg-canvas",
  ghost: "text-ink-700 hover:bg-canvas",
};

const sizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {children}
    </button>
  );
}
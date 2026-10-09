export default function Field({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-sm font-medium text-ink-900">
        {label}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-ink-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}export default function Field({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-sm font-medium text-ink-900">
        {label}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-ink-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
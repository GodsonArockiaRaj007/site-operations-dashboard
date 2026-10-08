const FormField = ({
  id,
  label,
  required = false,
  hint,
  className = "",
  children,
}) => (
  <div className={className}>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-medium text-slate-700"
    >
      {label}
      {required && (
        <span className="ml-1 text-red-600" aria-label="required">
          *
        </span>
      )}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
  </div>
);

export default FormField;

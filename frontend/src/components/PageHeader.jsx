const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
    {action && <div className="flex shrink-0 items-center">{action}</div>}
  </div>
);

export default PageHeader;

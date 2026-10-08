const StatCard = ({
  title,
  value,
  icon: Icon,
  iconClass,
  note,
}) => (
  <article className="flex min-h-[150px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
      </span>
    </div>
    <div>
      <p className="text-3xl font-semibold tracking-tight tabular-nums text-slate-900">
        {Number(value).toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  </article>
);

export default StatCard;

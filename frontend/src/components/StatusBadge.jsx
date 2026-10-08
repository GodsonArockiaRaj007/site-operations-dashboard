const styles = {
  pending: "bg-amber-50 text-amber-800 ring-amber-600/15",
  active: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
  in_progress: "bg-blue-50 text-blue-800 ring-blue-600/15",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
};

const labels = {
  in_progress: "In progress",
};

const StatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase() || "pending";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${
        styles[normalized] || "bg-slate-100 text-slate-700 ring-slate-500/15"
      }`}
    >
      {labels[normalized] || normalized.replaceAll("_", " ")}
    </span>
  );
};

export default StatusBadge;

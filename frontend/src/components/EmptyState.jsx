import { ClipboardList } from "lucide-react";

const EmptyState = ({
  icon: Icon = ClipboardList,
  title,
  description,
  compact = false,
}) => (
  <div
    className={`flex flex-col items-center justify-center px-6 text-center ${
      compact ? "py-8" : "py-12"
    }`}
  >
    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
    </span>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-sm text-sm leading-5 text-slate-500">
        {description}
      </p>
    )}
  </div>
);

export default EmptyState;

import { Loader2 } from "lucide-react";

const LoadingState = ({ label = "Loading..." }) => (
  <div
    className="flex min-h-[240px] items-center justify-center gap-3 text-sm text-slate-600"
    role="status"
    aria-live="polite"
  >
    <Loader2 size={19} className="animate-spin text-blue-600" />
    {label}
  </div>
);

export default LoadingState;

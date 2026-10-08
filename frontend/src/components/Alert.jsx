import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const variants = {
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-800",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
};

const Alert = ({ variant = "info", message }) => {
  if (!message) {
    return null;
  }

  const config = variants[variant] || variants.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${config.className}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
};

export default Alert;

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");
        const [summaryResponse, installationsResponse] = await Promise.all([
          api.get("/summary"),
          api.get("/installations"),
        ]);
        setSummary(summaryResponse.data.data);
        setInstallations(installationsResponse.data.data || []);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingState label="Loading your operations overview..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Overview"
          title="Operations dashboard"
          description="Monitor site activity and installation progress."
        />
        <Alert variant="error" message={error} />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Sites",
      value: summary?.totalSites ?? 0,
      icon: MapPin,
      iconClass: "bg-blue-50 text-blue-700",
      note: "Sites in your portfolio",
    },
    {
      title: "Active Sites",
      value: summary?.activeSites ?? 0,
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-700",
      note: "Currently operational",
    },
    {
      title: "Total Installations",
      value: summary?.totalInstallations ?? 0,
      icon: ClipboardList,
      iconClass: "bg-indigo-50 text-indigo-700",
      note: "Tracked activities",
    },
    {
      title: "Completed Installations",
      value: summary?.completedInstallations ?? 0,
      icon: CheckCircle2,
      iconClass: "bg-slate-100 text-slate-700",
      note: "Successfully completed",
    },
  ];

  const totalInstallations = Number(summary?.totalInstallations) || 0;
  const statusRows = [
    {
      label: "Completed",
      value: Number(summary?.completedInstallations) || 0,
      icon: CheckCircle2,
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
    },
    {
      label: "In progress",
      value: Number(summary?.inProgressInstallations) || 0,
      icon: RefreshCw,
      color: "bg-blue-500",
      textColor: "text-blue-700",
    },
    {
      label: "Pending",
      value: Number(summary?.pendingInstallations) || 0,
      icon: Clock3,
      color: "bg-amber-500",
      textColor: "text-amber-700",
    },
  ];

  const percentFor = (value) =>
    totalInstallations > 0
      ? Math.min(100, Math.max(0, (value / totalInstallations) * 100))
      : 0;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Overview"
        title="Operations dashboard"
        description="A clear view of your sites and installation activity."
      />

      <section
        aria-label="Operational summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(290px,0.85fr)_minmax(0,1.6fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">
              Installation status
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Progress across all tracked activities
            </p>
          </div>

          {totalInstallations === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No installations yet"
              description="Status progress will appear here when installations are added."
              compact
            />
          ) : (
            <div className="space-y-5">
              {statusRows.map((row) => {
                const percentage = percentFor(row.value);
                const Icon = row.icon;
                return (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Icon size={16} className={row.textColor} />
                        {row.label}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold tabular-nums text-slate-900">
                          {row.value}
                        </span>
                        <span className="ml-2 text-xs tabular-nums text-slate-500">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-label={`${row.label} installations`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(percentage)}
                    >
                      <div
                        className={`h-full rounded-full transition-[width] duration-300 ${row.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent installations
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest activity across your sites
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {installations.length} total
            </span>
          </div>

          {installations.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No recent installations"
              description="Installation records will appear here once created."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                      Site
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Activity
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Scheduled
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {installations.slice(0, 5).map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <span className="block text-sm font-medium text-slate-800">
                          {item.site_name || "Unknown site"}
                        </span>
                        {item.site_location && (
                          <span className="mt-1 block text-xs text-slate-500">
                            {item.site_location}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.activity_type}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {item.scheduled_date
                          ? new Date(item.scheduled_date).toLocaleDateString()
                          : "Not scheduled"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

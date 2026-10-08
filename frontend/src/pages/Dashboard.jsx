import { useEffect, useState } from "react";
import api from "../services/api";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");

        const [summaryResponse, installationsResponse] =
          await Promise.all([
            api.get("/summary"),
            api.get("/installations"),
          ]);

        setSummary(summaryResponse.data.data);
        setInstallations(
          installationsResponse.data.data || []
        );
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Sites",
      value: summary?.totalSites ?? 0,
    },
    {
      title: "Active Sites",
      value: summary?.activeSites ?? 0,
    },
    {
      title: "Total Installations",
      value: summary?.totalInstallations ?? 0,
    },
    {
      title: "Completed",
      value: summary?.completedInstallations ?? 0,
    },
  ];

  const calculatePercentage = (value) => {
    if (!summary?.totalInstallations) {
      return 0;
    }

    return (
      (value / summary.totalInstallations) *
      100
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Operations Overview
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor site activity and installation progress.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {card.title}
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-800">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Status and Recent Installations */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Installation Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Installation Status
          </h2>

          <div className="mt-6 space-y-5">
            {/* Completed */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Completed
                </span>

                <span className="font-semibold">
                  {summary?.completedInstallations ?? 0}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{
                    width: `${calculatePercentage(
                      summary?.completedInstallations ?? 0
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  In Progress
                </span>

                <span className="font-semibold">
                  {summary?.inProgressInstallations ?? 0}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${calculatePercentage(
                      summary?.inProgressInstallations ?? 0
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Pending */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">
                  Pending
                </span>

                <span className="font-semibold">
                  {summary?.pendingInstallations ?? 0}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{
                    width: `${calculatePercentage(
                      summary?.pendingInstallations ?? 0
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Installations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Installations
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Site
                  </th>

                  <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Activity
                  </th>

                  <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {installations
                  .slice(0, 5)
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100"
                    >
                      <td className="py-4 text-sm font-medium text-slate-800">
                        {item.site_name}
                      </td>

                      <td className="py-4 text-sm text-slate-600">
                        {item.activity_type}
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : item.status ===
                                "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status
                            ?.replace("_", " ")
                            .toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {installations.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                No installations available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
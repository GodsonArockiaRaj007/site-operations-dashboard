import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  site_id: "",
  activity_type: "",
  status: "pending",
  scheduled_date: "",
  completed_date: "",
  notes: "",
};

const Installations = () => {
  const [installations, setInstallations] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInstallationId, setEditingInstallationId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setError("");
      const [installationsResponse, sitesResponse] = await Promise.all([
        api.get("/installations"),
        api.get("/sites"),
      ]);
      setInstallations(installationsResponse.data.data || []);
      setSites(sitesResponse.data.data || []);
    } catch (error) {
      console.error("Installation fetch error:", error);
      setError("Failed to load installation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingInstallationId(null);
    setShowForm(false);
    setError("");
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (installation) => {
    setEditingInstallationId(installation.id);
    setForm({
      site_id: String(installation.site_id),
      activity_type: installation.activity_type || "",
      status: installation.status || "pending",
      scheduled_date: installation.scheduled_date
        ? new Date(installation.scheduled_date).toISOString().slice(0, 10)
        : "",
      completed_date: installation.completed_date
        ? new Date(installation.completed_date).toISOString().slice(0, 10)
        : "",
      notes: installation.notes || "",
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const installationData = {
      ...form,
      site_id: Number(form.site_id),
      activity_type: form.activity_type.trim(),
      scheduled_date: form.scheduled_date || null,
      completed_date: form.completed_date || null,
      notes: form.notes.trim() || null,
    };

    if (!form.site_id || !installationData.activity_type) {
      setError("Site and activity type are required.");
      return;
    }

    try {
      if (editingInstallationId === null) {
        await api.post("/installations", installationData);
      } else {
        await api.put(
          `/installations/${editingInstallationId}`,
          installationData
        );
      }

      resetForm();
      await fetchData();
    } catch (error) {
      console.error("Save installation error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save installation."
      );
    }
  };

  const handleDelete = async (installation) => {
    if (
      !window.confirm(
        `Delete the "${installation.activity_type}" installation at "${installation.site_name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setError("");
    try {
      await api.delete(`/installations/${installation.id}`);
      if (editingInstallationId === installation.id) {
        resetForm();
      }
      await fetchData();
    } catch (error) {
      console.error("Delete installation error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to delete installation."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  const filteredInstallations = installations.filter((installation) => {
    const searchValue = search.toLowerCase();
    const matchesSearch = [
      installation.site_name,
      installation.site_location,
      installation.activity_type,
      installation.status,
      installation.assigned_to,
      installation.notes,
    ].some((value) => value?.toLowerCase().includes(searchValue));

    return (
      matchesSearch &&
      (statusFilter === "all" || installation.status === statusFilter)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Installations
          </h1>
          <p className="mt-1 text-slate-500">
            Track installation activities.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setForm(emptyForm);
              setEditingInstallationId(null);
              setShowForm(true);
              setError("");
            }
          }}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Installation"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            {editingInstallationId === null
              ? "Add Installation"
              : "Edit Installation"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <select
              name="site_id"
              value={form.site_id}
              onChange={handleChange}
              aria-label="Installation site"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="activity_type"
              value={form.activity_type}
              onChange={handleChange}
              placeholder="Activity type"
              aria-label="Activity type"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              aria-label="Installation status"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="date"
              name="scheduled_date"
              value={form.scheduled_date}
              onChange={handleChange}
              aria-label="Scheduled date"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="date"
              name="completed_date"
              value={form.completed_date}
              onChange={handleChange}
              aria-label="Completed date"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
              aria-label="Notes"
              rows="3"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 md:col-span-2"
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-900 md:w-fit"
            >
              {editingInstallationId === null
                ? "Create Installation"
                : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {!showForm && error && (
        <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by site, activity, assignee or notes..."
          aria-label="Search installations"
          className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter installations by status"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading installations...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[950px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Site
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Activity
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Scheduled
                </th>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredInstallations.map((installation) => (
                <tr
                  key={installation.id}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {installation.site_name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {installation.activity_type}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        installation.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : installation.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {installation.status
                        ?.replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(installation.scheduled_date)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(installation)}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(installation)}
                        className="font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInstallations.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No installations found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Installations;

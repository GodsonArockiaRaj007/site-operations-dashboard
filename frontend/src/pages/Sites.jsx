import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  name: "",
  location: "",
  status: "pending",
};

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);

  const fetchSites = async () => {
    try {
      setError("");
      const response = await api.get("/sites");
      setSites(response.data.data || []);
    } catch (error) {
      console.error("Sites error:", error);
      setError("Failed to load sites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSiteId(null);
    setShowForm(false);
    setError("");
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = (site) => {
    setEditingSiteId(site.id);
    setForm({
      name: site.name,
      location: site.location,
      status: site.status,
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const siteData = {
      ...form,
      name: form.name.trim(),
      location: form.location.trim(),
    };

    if (!siteData.name || !siteData.location) {
      setError("Site name and location are required.");
      return;
    }

    try {
      if (editingSiteId === null) {
        await api.post("/sites", siteData);
      } else {
        await api.put(`/sites/${editingSiteId}`, siteData);
      }

      resetForm();
      await fetchSites();
    } catch (error) {
      console.error("Save site error:", error);
      setError(
        error.response?.data?.message || "Failed to save site."
      );
    }
  };

  const handleDelete = async (site) => {
    if (!window.confirm(`Delete "${site.name}"? This cannot be undone.`)) {
      return;
    }

    setError("");
    try {
      await api.delete(`/sites/${site.id}`);
      if (editingSiteId === site.id) {
        resetForm();
      }
      await fetchSites();
    } catch (error) {
      console.error("Delete site error:", error);
      setError(
        error.response?.data?.message || "Failed to delete site."
      );
    }
  };

  const filteredSites = sites.filter((site) => {
    const searchValue = search.toLowerCase();
    const matchesSearch =
      site.name?.toLowerCase().includes(searchValue) ||
      site.location?.toLowerCase().includes(searchValue) ||
      site.status?.toLowerCase().includes(searchValue);

    return (
      matchesSearch &&
      (statusFilter === "all" || site.status === statusFilter)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sites</h1>
          <p className="mt-1 text-slate-500">
            Manage operational sites.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setForm(emptyForm);
              setEditingSiteId(null);
              setShowForm(true);
              setError("");
            }
          }}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Site"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            {editingSiteId === null ? "Add New Site" : "Edit Site"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Site name"
              aria-label="Site name"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Location"
              aria-label="Location"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              aria-label="Site status"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-900 md:w-fit"
            >
              {editingSiteId === null ? "Create Site" : "Save Changes"}
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
          placeholder="Search by site, location or status..."
          aria-label="Search sites"
          className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter sites by status"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading sites...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Site
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Created By
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSites.map((site) => (
                <tr
                  key={site.id}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {site.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {site.location}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        site.status === "active"
                          ? "bg-green-100 text-green-700"
                          : site.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {site.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {site.created_by || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(site)}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(site)}
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

          {filteredSites.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No sites found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sites;

import { useEffect, useState } from "react";
import { MapPin, Plus, Search } from "lucide-react";
import api from "../services/api";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

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
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSites = async () => {
    try {
      const response = await api.get("/sites");
      setError("");
      setSites(response.data.data || []);
    } catch (error) {
      console.error("Sites error:", error);
      setError(
        error.response?.data?.message || "Failed to load sites."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchSites);
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSiteId(null);
    setShowForm(false);
    setError("");
  };

  const startCreate = () => {
    setForm(emptyForm);
    setEditingSiteId(null);
    setShowForm(true);
    setError("");
    setNotice("");
  };

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEdit = (site) => {
    setEditingSiteId(site.id);
    setForm({
      name: site.name || "",
      location: site.location || "",
      status: site.status || "pending",
    });
    setShowForm(true);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const siteData = {
      ...form,
      name: form.name.trim(),
      location: form.location.trim(),
    };

    if (!siteData.name || !siteData.location) {
      setError("Enter a site name and location to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = editingSiteId !== null;
      if (isEditing) {
        await api.put(`/sites/${editingSiteId}`, siteData);
      } else {
        await api.post("/sites", siteData);
      }

      resetForm();
      setNotice(isEditing ? "Site changes saved." : "Site created.");
      await fetchSites();
    } catch (error) {
      console.error("Save site error:", error);
      setError(
        error.response?.data?.message || "Failed to save site."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (site) => {
    if (!window.confirm(`Delete "${site.name}"? This cannot be undone.`)) {
      return;
    }

    setError("");
    setNotice("");
    setDeletingId(site.id);
    try {
      await api.delete(`/sites/${site.id}`);
      if (editingSiteId === site.id) {
        resetForm();
      }
      setNotice("Site deleted.");
      await fetchSites();
    } catch (error) {
      console.error("Delete site error:", error);
      setError(
        error.response?.data?.message || "Failed to delete site."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "—";

  const filteredSites = sites.filter((site) => {
    const searchValue = search.trim().toLowerCase();
    const matchesSearch = [
      site.name,
      site.location,
      site.status,
      site.created_by,
    ].some((value) => value?.toLowerCase().includes(searchValue));
    return (
      matchesSearch &&
      (statusFilter === "all" || site.status === statusFilter)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Sites"
        description="Manage locations and monitor their operational status."
        action={
          <button
            type="button"
            onClick={showForm ? resetForm : startCreate}
            className="btn-primary"
            disabled={submitting}
          >
            {showForm ? (
              "Close form"
            ) : (
              <>
                <Plus size={17} />
                Add site
              </>
            )}
          </button>
        }
      />

      {notice && <Alert variant="success" message={notice} />}
      {error && !showForm && <Alert variant="error" message={error} />}

      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900">
              {editingSiteId === null ? "Add a site" : "Edit site"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Site name and location are required.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {error && (
              <div className="mb-5">
                <Alert variant="error" message={error} />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField id="site-name" label="Site name" required>
                <input
                  id="site-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. North Ridge Facility"
                  autoComplete="organization"
                  className="form-control"
                  required
                  disabled={submitting}
                />
              </FormField>
              <FormField id="site-location" label="Location" required>
                <input
                  id="site-location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, region"
                  autoComplete="address-level2"
                  className="form-control"
                  required
                  disabled={submitting}
                />
              </FormField>
              <FormField id="site-status" label="Status">
                <select
                  id="site-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </FormField>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? editingSiteId === null
                    ? "Creating..."
                    : "Saving..."
                  : editingSiteId === null
                  ? "Create site"
                  : "Save changes"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sites..."
              aria-label="Search sites"
              className="form-control search-control"
            />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="site-status-filter" className="text-sm text-slate-500">
              Status
            </label>
            <select
              id="site-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control w-auto min-w-[145px]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading sites..." />
        ) : error && sites.length === 0 ? (
          <div className="p-5">
            <Alert variant="error" message={error} />
          </div>
        ) : filteredSites.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={sites.length === 0 ? "No sites yet" : "No matching sites"}
            description={
              sites.length === 0
                ? "Add your first site to start managing operations."
                : "Try adjusting your search or status filter."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="table-heading">
                      Site
                    </th>
                    <th scope="col" className="table-heading">
                      Location
                    </th>
                    <th scope="col" className="table-heading">
                      Status
                    </th>
                    <th scope="col" className="table-heading">
                      Created by
                    </th>
                    <th scope="col" className="table-heading">
                      Created
                    </th>
                    <th scope="col" className="table-heading">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSites.map((site) => (
                    <tr key={site.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="table-cell font-medium text-slate-900">
                        {site.name}
                      </td>
                      <td className="table-cell text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <MapPin size={15} className="text-slate-400" />
                          {site.location}
                        </span>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={site.status} />
                      </td>
                      <td className="table-cell text-slate-600">
                        {site.created_by || "-"}
                      </td>
                      <td className="table-cell whitespace-nowrap text-slate-600">
                        {formatDate(site.created_at)}
                      </td>
                      <td className="table-cell">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(site)}
                            className="text-sm font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(site)}
                            disabled={deletingId === site.id}
                            className="text-sm font-medium text-red-700 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-wait disabled:opacity-50"
                          >
                            {deletingId === site.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              Showing {filteredSites.length} of {sites.length} sites
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Sites;

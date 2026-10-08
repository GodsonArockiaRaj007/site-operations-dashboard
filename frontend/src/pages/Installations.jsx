import { useEffect, useState } from "react";
import { ClipboardList, Plus, Search } from "lucide-react";
import api from "../services/api";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

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
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      const [installationsResponse, sitesResponse] = await Promise.all([
        api.get("/installations"),
        api.get("/sites"),
      ]);
      setError("");
      setInstallations(installationsResponse.data.data || []);
      setSites(sitesResponse.data.data || []);
    } catch (error) {
      console.error("Installation fetch error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load installation data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingInstallationId(null);
    setShowForm(false);
    setError("");
  };

  const startCreate = () => {
    setForm(emptyForm);
    setEditingInstallationId(null);
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
    setNotice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const installationData = {
      ...form,
      site_id: Number(form.site_id),
      activity_type: form.activity_type.trim(),
      scheduled_date: form.scheduled_date || null,
      completed_date: form.completed_date || null,
      notes: form.notes.trim() || null,
    };

    if (!form.site_id || !installationData.activity_type) {
      setError("Select a site and enter an activity type to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = editingInstallationId !== null;
      if (isEditing) {
        await api.put(
          `/installations/${editingInstallationId}`,
          installationData
        );
      } else {
        await api.post("/installations", installationData);
      }

      resetForm();
      setNotice(
        isEditing ? "Installation changes saved." : "Installation created."
      );
      await fetchData();
    } catch (error) {
      console.error("Save installation error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save installation."
      );
    } finally {
      setSubmitting(false);
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
    setNotice("");
    setDeletingId(installation.id);
    try {
      await api.delete(`/installations/${installation.id}`);
      if (editingInstallationId === installation.id) {
        resetForm();
      }
      setNotice("Installation deleted.");
      await fetchData();
    } catch (error) {
      console.error("Delete installation error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to delete installation."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "—";

  const filteredInstallations = installations.filter((installation) => {
    const searchValue = search.trim().toLowerCase();
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Installations"
        description="Schedule field activities and follow work through to completion."
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
                Add installation
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
              {editingInstallationId === null
                ? "Add an installation"
                : "Edit installation"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a site and describe the work to be performed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {error && (
              <div className="mb-5">
                <Alert variant="error" message={error} />
              </div>
            )}
            {sites.length === 0 && (
              <div className="mb-5">
                <Alert
                  variant="info"
                  message="Create a site before adding an installation."
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField id="installation-site" label="Site" required>
                <select
                  id="installation-site"
                  name="site_id"
                  value={form.site_id}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={submitting || sites.length === 0}
                >
                  <option value="">Select a site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                id="installation-activity"
                label="Activity type"
                required
              >
                <input
                  id="installation-activity"
                  type="text"
                  name="activity_type"
                  value={form.activity_type}
                  onChange={handleChange}
                  placeholder="e.g. Equipment installation"
                  className="form-control"
                  required
                  disabled={submitting}
                />
              </FormField>
              <FormField id="installation-status" label="Status">
                <select
                  id="installation-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </FormField>
              <FormField id="installation-scheduled" label="Scheduled date">
                <input
                  id="installation-scheduled"
                  type="date"
                  name="scheduled_date"
                  value={form.scheduled_date}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                />
              </FormField>
              <FormField id="installation-completed" label="Completed date">
                <input
                  id="installation-completed"
                  type="date"
                  name="completed_date"
                  value={form.completed_date}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                />
              </FormField>
              <FormField
                id="installation-notes"
                label="Notes"
                className="sm:col-span-2 lg:col-span-3"
              >
                <textarea
                  id="installation-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add relevant details or instructions"
                  rows={3}
                  className="form-control h-auto min-h-[88px] resize-y py-2.5"
                  disabled={submitting}
                />
              </FormField>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || sites.length === 0}
              >
                {submitting
                  ? editingInstallationId === null
                    ? "Creating..."
                    : "Saving..."
                  : editingInstallationId === null
                  ? "Create installation"
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
              placeholder="Search installations..."
              aria-label="Search installations"
              className="form-control pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="installation-status-filter"
              className="text-sm text-slate-500"
            >
              Status
            </label>
            <select
              id="installation-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control w-auto min-w-[145px]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading installations..." />
        ) : error && installations.length === 0 ? (
          <div className="p-5">
            <Alert variant="error" message={error} />
          </div>
        ) : filteredInstallations.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={
              installations.length === 0
                ? "No installations yet"
                : "No matching installations"
            }
            description={
              installations.length === 0
                ? "Add an installation to start tracking field activity."
                : "Try adjusting your search or status filter."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[890px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="table-heading">
                      Site
                    </th>
                    <th scope="col" className="table-heading">
                      Activity
                    </th>
                    <th scope="col" className="table-heading">
                      Assigned technician
                    </th>
                    <th scope="col" className="table-heading">
                      Scheduled
                    </th>
                    <th scope="col" className="table-heading">
                      Status
                    </th>
                    <th scope="col" className="table-heading">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInstallations.map((installation) => (
                    <tr
                      key={installation.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="table-cell font-medium text-slate-900">
                        <span className="block">{installation.site_name}</span>
                        {installation.site_location && (
                          <span className="mt-1 block text-xs font-normal text-slate-500">
                            {installation.site_location}
                          </span>
                        )}
                      </td>
                      <td className="table-cell text-slate-700">
                        {installation.activity_type}
                      </td>
                      <td className="table-cell text-slate-600">
                        {installation.assigned_to || "Unassigned"}
                      </td>
                      <td className="table-cell whitespace-nowrap text-slate-600">
                        {formatDate(installation.scheduled_date)}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={installation.status} />
                      </td>
                      <td className="table-cell">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(installation)}
                            className="text-sm font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(installation)}
                            disabled={deletingId === installation.id}
                            className="text-sm font-medium text-red-700 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-wait disabled:opacity-50"
                          >
                            {deletingId === installation.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              Showing {filteredInstallations.length} of {installations.length}{" "}
              installations
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Installations;

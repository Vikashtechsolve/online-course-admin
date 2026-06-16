import { useCallback, useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { Loader2, Plus, Download, RefreshCw, Users } from "lucide-react";
import {
  COURSE_TYPES,
  MARKETING_STATUS_OPTIONS,
  PROGRAM_OPTIONS,
  PAYMENT_PLAN_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  fetchIntakeBatches,
  createIntakeBatch,
  updateIntakeBatch,
  fetchRegistrations,
  updateRegistration,
  downloadRegistrationsExport,
} from "../utils/courseLeadsApi";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function paymentStatusBadgeClass(status) {
  if (status === "completed") return "bg-green-100 text-green-800";
  if (status === "pending") return "bg-amber-100 text-amber-900";
  if (status === "failed") return "bg-red-100 text-red-800";
  if (status === "refunded") return "bg-gray-200 text-gray-700";
  return "bg-gray-100 text-gray-600";
}

function paymentPlanLabel(plan) {
  return PAYMENT_PLAN_OPTIONS.find((p) => p.value === plan)?.label || plan?.replace("_", " ") || "—";
}

export default function StudentRegistrations() {
  const [tab, setTab] = useState("registrations");

  const [batches, setBatches] = useState([]);
  const [batchCourseFilter, setBatchCourseFilter] = useState("");
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchModal, setBatchModal] = useState(null);
  const [batchSaving, setBatchSaving] = useState(false);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterPaymentPlan, setFilterPaymentPlan] = useState("");
  const [search, setSearch] = useState("");

  const [editRow, setEditRow] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editAmountPaid, setEditAmountPaid] = useState("");
  const [editBalanceDue, setEditBalanceDue] = useState("");
  const [editRazorpayPaymentId, setEditRazorpayPaymentId] = useState("");
  const [savingRow, setSavingRow] = useState(false);

  const loadBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const list = await fetchIntakeBatches();
      setBatches(list);
    } catch {
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  }, []);

  const batchesForTable = useMemo(() => {
    if (!batchCourseFilter) return batches;
    return batches.filter((b) => b.courseType === batchCourseFilter);
  }, [batches, batchCourseFilter]);

  const listParams = useMemo(
    () => ({
      page,
      limit: 25,
      courseType: filterCourse || undefined,
      intakeBatchId: filterBatch || undefined,
      program: filterProgram || undefined,
      marketingStatus: filterStatus || undefined,
      paymentStatus: filterPaymentStatus || undefined,
      paymentPlan: filterPaymentPlan || undefined,
      search: search.trim() || undefined,
    }),
    [
      page,
      filterCourse,
      filterBatch,
      filterProgram,
      filterStatus,
      filterPaymentStatus,
      filterPaymentPlan,
      search,
    ]
  );

  const exportParams = useMemo(
    () => ({
      courseType: filterCourse || undefined,
      intakeBatchId: filterBatch || undefined,
      program: filterProgram || undefined,
      marketingStatus: filterStatus || undefined,
      paymentStatus: filterPaymentStatus || undefined,
      paymentPlan: filterPaymentPlan || undefined,
      search: search.trim() || undefined,
    }),
    [
      filterCourse,
      filterBatch,
      filterProgram,
      filterStatus,
      filterPaymentStatus,
      filterPaymentPlan,
      search,
    ]
  );

  const loadRegistrations = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await fetchRegistrations(listParams);
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setItems([]);
    } finally {
      setListLoading(false);
    }
  }, [listParams]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const batchOptionsForFilter = useMemo(() => {
    let list = batches;
    if (filterCourse) list = list.filter((b) => b.courseType === filterCourse);
    return list;
  }, [batches, filterCourse]);

  useEffect(() => {
    if (filterCourse && filterBatch) {
      const still = batchOptionsForFilter.some((b) => String(b._id) === filterBatch);
      if (!still) setFilterBatch("");
    }
  }, [filterCourse, filterBatch, batchOptionsForFilter]);

  const openNewBatchModal = () => {
    setBatchModal({
      mode: "create",
      courseType: "fullstack_developer",
      displayName: "",
      batchStartDate: "",
      isAcceptingRegistrations: true,
      isActive: true,
    });
  };

  const openEditBatch = (b) => {
    setBatchModal({
      mode: "edit",
      id: b._id,
      courseType: b.courseType,
      displayName: b.displayName,
      batchStartDate: b.batchStartDate ? b.batchStartDate.slice(0, 10) : "",
      isAcceptingRegistrations: b.isAcceptingRegistrations,
      isActive: b.isActive,
    });
  };

  const saveBatchModal = async () => {
    if (!batchModal?.displayName?.trim()) return;
    setBatchSaving(true);
    try {
      if (batchModal.mode === "create") {
        await createIntakeBatch({
          courseType: batchModal.courseType,
          displayName: batchModal.displayName.trim(),
          batchStartDate: batchModal.batchStartDate || null,
          isAcceptingRegistrations: batchModal.isAcceptingRegistrations,
          isActive: batchModal.isActive,
        });
      } else {
        await updateIntakeBatch(batchModal.id, {
          courseType: batchModal.courseType,
          displayName: batchModal.displayName.trim(),
          batchStartDate: batchModal.batchStartDate || null,
          isAcceptingRegistrations: batchModal.isAcceptingRegistrations,
          isActive: batchModal.isActive,
        });
      }
      setBatchModal(null);
      await loadBatches();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Could not save batch");
    } finally {
      setBatchSaving(false);
    }
  };

  const toggleBatchField = async (b, field) => {
    try {
      await updateIntakeBatch(b._id, { [field]: !b[field] });
      await loadBatches();
    } catch (e) {
      alert(e.response?.data?.message || "Update failed");
    }
  };

  const openEditLead = (row) => {
    setEditRow(row);
    setEditStatus(row.marketingStatus);
    setEditNotes(row.adminNotes || "");
    setEditPaymentStatus(row.paymentStatus || "pending");
    setEditAmountPaid(row.amountPaid != null ? String(row.amountPaid) : "0");
    setEditBalanceDue(row.balanceDue != null ? String(row.balanceDue) : "0");
    setEditRazorpayPaymentId(row.razorpayPaymentId || "");
  };

  const buildLeadUpdatePayload = (overrides = {}) => {
    const payload = {
      marketingStatus: editStatus,
      adminNotes: editNotes,
      ...overrides,
    };
    if (editRow?.paymentPlan) {
      payload.paymentStatus = overrides.paymentStatus ?? editPaymentStatus;
      payload.amountPaid = Number(
        overrides.amountPaid ?? editAmountPaid
      );
      payload.balanceDue = Number(
        overrides.balanceDue ?? editBalanceDue
      );
      payload.razorpayPaymentId =
        overrides.razorpayPaymentId ?? editRazorpayPaymentId;
    }
    return payload;
  };

  const saveLead = async (overrides = {}) => {
    if (!editRow) return;

    const payload = buildLeadUpdatePayload(overrides);
    if (editRow.paymentPlan) {
      if (Number.isNaN(payload.amountPaid) || payload.amountPaid < 0) {
        alert("Enter a valid amount paid.");
        return;
      }
      if (Number.isNaN(payload.balanceDue) || payload.balanceDue < 0) {
        alert("Enter a valid balance due.");
        return;
      }
    }

    setSavingRow(true);
    try {
      const updated = await updateRegistration(
        editRow._id,
        buildLeadUpdatePayload(overrides)
      );
      setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      setEditRow(null);
    } catch (e) {
      alert(e.response?.data?.message || "Could not save");
    } finally {
      setSavingRow(false);
    }
  };

  const markBalanceCollected = () => {
    if (!editRow?.paymentPlan) return;
    const paid = Number(editAmountPaid) || 0;
    const due = Number(editBalanceDue) || 0;
    saveLead({
      balanceDue: 0,
      paymentStatus: "completed",
      amountPaid: paid + due,
      marketingStatus: "enrolled",
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadRegistrationsExport(exportParams);
    } catch (e) {
      alert(e.response?.data?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const courseLabel = (t) => COURSE_TYPES.find((c) => c.value === t)?.label || t;

  return (
    <div className="space-y-6 px-4 md:px-0">
      <Breadcrumbs items={[{ label: "Student registration (marketing)", to: "/student-registrations" }]} />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="soft-banner rounded-xl p-6 w-full md:w-[58%] flex items-center gap-4">
          <Users className="text-[#B11C20] shrink-0" size={40} />
          <div>
            <h1 className="text-lg md:text-xl text-[#B11C20] font-semibold">
              Student registration
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Intake batches for public course pages, leads from Apply Now, and Excel export for your
              marketing team. Close a batch when you announce the next one.
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setTab("registrations");
              loadRegistrations();
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              tab === "registrations"
                ? "bg-white shadow-sm border border-red-200 text-[#B11C20]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Leads
          </button>
          <button
            type="button"
            onClick={() => setTab("batches")}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              tab === "batches"
                ? "bg-white shadow-sm border border-red-200 text-[#B11C20]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Intake batches
          </button>
        </div>
      </div>

      {tab === "batches" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Course</label>
              <select
                value={batchCourseFilter}
                onChange={(e) => setBatchCourseFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {COURSE_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadBatches}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw size={18} className={batchesLoading ? "animate-spin" : ""} />
              </button>
            </div>
            <button
              type="button"
              onClick={openNewBatchModal}
              className="inline-flex items-center justify-center gap-2 bg-[#B11C20] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-800"
            >
              <Plus size={18} />
              New intake batch
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {batchesLoading ? (
              <div className="flex justify-center py-16 text-gray-500">
                <Loader2 className="animate-spin" size={28} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Batch</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Course</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Start date</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Open</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Active</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Leads</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchesForTable.map((b) => (
                      <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50/80">
                        <td className="p-3 font-medium text-gray-900">{b.displayName}</td>
                        <td className="p-3 text-gray-600">{courseLabel(b.courseType)}</td>
                        <td className="p-3 text-gray-600">{formatDate(b.batchStartDate)}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleBatchField(b, "isAcceptingRegistrations")}
                            className={`text-xs font-medium px-2 py-1 rounded-md ${
                              b.isAcceptingRegistrations
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {b.isAcceptingRegistrations ? "Yes" : "No"}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleBatchField(b, "isActive")}
                            className={`text-xs font-medium px-2 py-1 rounded-md ${
                              b.isActive ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {b.isActive ? "Yes" : "No"}
                          </button>
                        </td>
                        <td className="p-3 text-right text-gray-700">{b.registrationCount ?? 0}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => openEditBatch(b)}
                            className="text-[#B11C20] font-medium hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batchesForTable.length === 0 && (
                  <p className="text-center text-gray-500 py-10">
                    No batches yet. Create one for each course before students can apply.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "registrations" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-end gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Course</label>
                <select
                  value={filterCourse}
                  onChange={(e) => {
                    setFilterCourse(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[160px]"
                >
                  <option value="">All courses</option>
                  {COURSE_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Intake batch</label>
                <select
                  value={filterBatch}
                  onChange={(e) => {
                    setFilterBatch(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[200px]"
                >
                  <option value="">All batches</option>
                  {batchOptionsForFilter.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.displayName} ({courseLabel(b.courseType)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Program</label>
                <select
                  value={filterProgram}
                  onChange={(e) => {
                    setFilterProgram(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  {PROGRAM_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Lead status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  {MARKETING_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Payment</label>
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => {
                    setFilterPaymentStatus(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[120px]"
                >
                  <option value="">All</option>
                  {PAYMENT_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Plan</label>
                <select
                  value={filterPaymentPlan}
                  onChange={(e) => {
                    setFilterPaymentPlan(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">All</option>
                  {PAYMENT_PLAN_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                <label className="text-xs text-gray-500">Search</label>
                <input
                  type="search"
                  placeholder="Name, email, phone…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center justify-center gap-2 border border-[#B11C20] text-[#B11C20] px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                Excel
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Showing {items.length} of {total} (page {page} of {totalPages})
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {listLoading ? (
              <div className="flex justify-center py-16 text-gray-500">
                <Loader2 className="animate-spin" size={28} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">When</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Contact</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Batch</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Program</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Payment</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Paid</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Lead status</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={row._id} className="border-b border-gray-100 hover:bg-gray-50/80">
                        <td className="p-3 text-gray-600 whitespace-nowrap">
                          {formatDateTime(row.createdAt)}
                        </td>
                        <td className="p-3 font-medium text-gray-900">{row.fullName}</td>
                        <td className="p-3 text-gray-600">
                          <div>{row.email}</div>
                          <div className="text-xs">{row.phone}</div>
                        </td>
                        <td className="p-3 text-gray-600 max-w-[200px]">
                          <div className="truncate" title={row.intakeBatch?.displayName}>
                            {row.intakeBatch?.displayName || "—"}
                          </div>
                          <div className="text-xs text-gray-400">{courseLabel(row.courseType)}</div>
                        </td>
                        <td className="p-3 capitalize">{row.program}</td>
                        <td className="p-3 text-gray-600 text-xs">
                          {row.paymentPlan ? (
                            <>
                              <div className="text-gray-700 font-medium">
                                {paymentPlanLabel(row.paymentPlan)}
                              </div>
                              <span
                                className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${paymentStatusBadgeClass(row.paymentStatus)}`}
                              >
                                {PAYMENT_STATUS_OPTIONS.find(
                                  (x) => x.value === row.paymentStatus
                                )?.label || row.paymentStatus || "—"}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">Free lead</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">
                          {row.amountPaid > 0 ? (
                            <>
                              <div className="font-medium">₹{row.amountPaid}</div>
                              {row.balanceDue > 0 && (
                                <div className="text-xs text-gray-400">
                                  Due ₹{row.balanceDue}
                                </div>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-medium px-2 py-1 rounded-md bg-amber-50 text-amber-900">
                            {MARKETING_STATUS_OPTIONS.find((x) => x.value === row.marketingStatus)
                              ?.label || row.marketingStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => openEditLead(row)}
                            className="text-[#B11C20] font-medium hover:underline"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && (
                  <p className="text-center text-gray-500 py-10">No registrations match your filters.</p>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {batchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {batchModal.mode === "create" ? "New intake batch" : "Edit intake batch"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Course</label>
                <select
                  value={batchModal.courseType}
                  onChange={(e) => setBatchModal((m) => ({ ...m, courseType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {COURSE_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Display name</label>
                <input
                  value={batchModal.displayName}
                  onChange={(e) => setBatchModal((m) => ({ ...m, displayName: e.target.value }))}
                  placeholder="e.g. January 2026 intake"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Batch start date (optional)</label>
                <input
                  type="date"
                  value={batchModal.batchStartDate}
                  onChange={(e) => setBatchModal((m) => ({ ...m, batchStartDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={batchModal.isAcceptingRegistrations}
                  onChange={(e) =>
                    setBatchModal((m) => ({ ...m, isAcceptingRegistrations: e.target.checked }))
                  }
                />
                Accepting new registrations (Apply Now)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={batchModal.isActive}
                  onChange={(e) => setBatchModal((m) => ({ ...m, isActive: e.target.checked }))}
                />
                Active (visible in admin lists)
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBatchModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={batchSaving}
                onClick={saveBatchModal}
                className="px-4 py-2 rounded-lg bg-[#B11C20] text-white text-sm font-medium hover:bg-red-800 disabled:opacity-50"
              >
                {batchSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900">
              Manage registration — {editRow.fullName}
            </h3>
            <p className="text-sm text-gray-600">{editRow.email}</p>

            {editRow.paymentPlan ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#B11C20]">
                  Payment
                </p>
                <p className="text-sm text-gray-700">
                  Plan:{" "}
                  <span className="font-medium">
                    {paymentPlanLabel(editRow.paymentPlan)}
                  </span>
                </p>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Payment status
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {PAYMENT_STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Amount paid (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editAmountPaid}
                      onChange={(e) => setEditAmountPaid(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Balance due (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editBalanceDue}
                      onChange={(e) => setEditBalanceDue(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Razorpay payment ID
                  </label>
                  <input
                    type="text"
                    value={editRazorpayPaymentId}
                    onChange={(e) => setEditRazorpayPaymentId(e.target.value)}
                    placeholder="pay_…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>

                {editRow.paidAt && (
                  <p className="text-xs text-gray-500">
                    Last paid: {formatDateTime(editRow.paidAt)}
                  </p>
                )}

                {Number(editBalanceDue) > 0 && editPaymentStatus === "completed" && (
                  <button
                    type="button"
                    disabled={savingRow}
                    onClick={markBalanceCollected}
                    className="w-full text-sm font-medium text-green-800 bg-green-50 border border-green-200 rounded-lg py-2 hover:bg-green-100 disabled:opacity-50"
                  >
                    Mark joining fee collected (clear balance · enroll)
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 rounded-lg bg-gray-50 border border-gray-200 p-3">
                This lead has no online payment — only marketing status applies.
              </p>
            )}

            <div>
              <label className="text-xs text-gray-500 block mb-1">Lead status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {MARKETING_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Internal notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Call notes, payment follow-up, next action…"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditRow(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingRow}
                onClick={() => saveLead()}
                className="px-4 py-2 rounded-lg bg-[#B11C20] text-white text-sm font-medium hover:bg-red-800 disabled:opacity-50"
              >
                {savingRow ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

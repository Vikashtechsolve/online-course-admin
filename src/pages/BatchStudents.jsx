import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserCircle,
  ChevronLeft,
  Loader2,
  Plus,
  Upload,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Mail,
} from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { getBatches, getBatchById } from "../utils/batchesApi";
import {
  getBatchStudents,
  enrollBatchStudentsFromCsv,
  removeBatchStudent,
  updateBatchStudentAccess,
} from "../utils/batchStudentsApi";
import AddBatchStudentModal from "../components/AddBatchStudentModal";

export default function BatchStudents() {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const fileInputRef = useRef(null);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(batchId);
      const batchData = isObjectId
        ? await getBatchById(batchId)
        : (await getBatches()).batches?.find((b) => b.slug === batchId);
      if (batchData) setBatch(batchData);

      const res = await getBatchStudents(batchId, search ? { search } : {});
      setStudents(res.students || []);
    } catch {
      setBatch(null);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [batchId, search]);

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await enrollBatchStudentsFromCsv(batchId, file);
      setUploadResult(result);
      loadData();
    } catch (err) {
      setUploadResult({
        added: 0,
        skipped: 0,
        errors: [err.response?.data?.message || "Upload failed"],
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async (student) => {
    if (!confirm(`Remove ${student.student?.name} from this batch?`)) return;
    try {
      await removeBatchStudent(batchId, student.student._id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove");
    }
  };

  const handleToggleAccess = async (enrollment) => {
    const newActive = !enrollment.isActive;
    try {
      await updateBatchStudentAccess(batchId, enrollment.student._id, {
        isActive: newActive,
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  const handleToggleUserActive = async (enrollment) => {
    const newActive = !enrollment.student?.isActive;
    try {
      await updateBatchStudentAccess(batchId, enrollment.student._id, {
        userIsActive: newActive,
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  if (!batch) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Manage Batches", to: "/manage-batches" },
          { label: batch.name, to: `/manage-batches/${batchId}` },
          { label: "Students" },
        ]}
      />

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/manage-batches/${batchId}`)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-slate-100 transition text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-[#B11C20]" />
            {batch.name} – Students
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B11C20] text-white font-medium hover:opacity-90 shadow-sm transition-colors"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
        Students in this batch have access to all courses. CSV format: <code className="bg-white px-1 rounded">name, email, password</code> (one per line, no header required)
      </div>

      {uploadResult && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="font-medium text-slate-700">
            CSV result: {uploadResult.added} added, {uploadResult.skipped} skipped
          </p>
          {uploadResult.errors?.length > 0 && (
            <ul className="mt-2 text-red-600 text-xs space-y-1">
              {uploadResult.errors.slice(0, 5).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {uploadResult.errors.length > 5 && (
                <li>...and {uploadResult.errors.length - 5} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <UserCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No students in this batch</p>
          <p className="text-slate-500 text-sm mt-1">Add students manually or upload a CSV.</p>
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B11C20] text-white text-sm font-medium hover:opacity-90"
            >
              <Plus size={16} />
              Add Student
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50"
            >
              <Upload size={16} />
              Upload CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((enrollment) => (
                  <tr key={enrollment._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{enrollment.student?.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Mail size={14} />
                        {enrollment.student?.email}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            enrollment.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {enrollment.isActive ? "Batch active" : "Suspended"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            enrollment.student?.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {enrollment.student?.isActive ? "Account active" : "Account inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleAccess(enrollment)}
                          title={enrollment.isActive ? "Suspend from batch" : "Reactivate in batch"}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50"
                        >
                          {enrollment.isActive ? "Suspend" : "Reactivate"}
                        </button>
                        <button
                          onClick={() => handleToggleUserActive(enrollment)}
                          title={enrollment.student?.isActive ? "Deactivate account" : "Activate account"}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50"
                        >
                          {enrollment.student?.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleRemove(enrollment)}
                          title="Remove from batch"
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddBatchStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadData}
        batchId={batchId}
      />
    </div>
  );
}

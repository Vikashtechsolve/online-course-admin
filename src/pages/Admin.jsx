import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ChevronRight, Plus, GraduationCap, UserCheck, UserCircle, Loader2, Trash2, Pencil, Layers } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import AddBatchModal from "../components/AddBatchModal";
import { getBatches, deleteBatch } from "../utils/batchesApi";

export default function Admin() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBatches();
      setBatches(data.batches || []);
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleDeleteBatch = async (batch) => {
    if (!confirm(`Deactivate batch "${batch.name}"? Courses in this batch will remain but the batch won't appear active.`)) return;
    setDeletingId(batch._id);
    try {
      await deleteBatch(batch._id);
      loadBatches();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete batch.");
    } finally {
      setDeletingId(null);
    }
  };

  const cards = [
    {
      title: "Manage Admins",
      description: "Enroll admins who can manage teachers, coordinators, and students.",
      icon: Shield,
      path: "/admin/admins",
      color: "admin",
    },
    {
      title: "Teachers",
      description: "Enroll and manage teachers who deliver lectures.",
      icon: GraduationCap,
      path: "/admin/teachers",
      color: "slate",
    },
    {
      title: "Course Coordinators",
      description: "Add coordinators for batch management.",
      icon: UserCheck,
      path: "/admin/coordinators",
      color: "violet",
    },
    {
      title: "Students",
      description: "Enroll students and manage their access.",
      icon: UserCircle,
      path: "/admin/students",
      color: "teal",
    },
  ];

  const colorClasses = {
    admin: "bg-[var(--accent-red-muted)] border-[var(--accent-red)]/30 text-[var(--accent-red)]",
    indigo: "bg-red-50 border-red-100 text-[#B11C20]",
    slate: "bg-slate-50 border-slate-200 text-slate-600",
    violet: "bg-violet-50 border-violet-100 text-violet-600",
    teal: "bg-teal-50 border-teal-100 text-teal-600",
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Super Admin Panel" }]} />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-slate-100 transition text-sm font-medium"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="w-7 h-7 text-[#B11C20]" />
          Super Admin Panel
        </h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
        Manage admins, teachers, coordinators, students, and batches. Full platform control.
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.path}
              onClick={() => navigate(card.path)}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-red-100 cursor-pointer transition flex items-start gap-4"
            >
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${colorClasses[card.color]}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  {card.title}
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </h2>
                <p className="text-slate-600 text-sm">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#B11C20]" />
            Batches
          </h2>
          <button
            onClick={() => {
              setEditingBatch(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B11C20] text-white font-medium hover:opacity-90 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Batch
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
          </div>
        ) : batches.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No batches yet</p>
            <p className="text-slate-500 text-sm mt-1">Create your first batch to organize courses.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B11C20] text-white text-sm font-medium hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Batch
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="bg-linear-to-br from-red-50 to-white rounded-xl p-5 flex justify-between items-center border border-red-100 shadow-sm hover:shadow-md hover:border-red-200 transition group relative"
              >
                <div
                  onClick={() => navigate(`/admin/batch/${batch.slug || batch._id}`)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#B11C20] text-white flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{batch.name}</h3>
                    {batch.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{batch.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBatch(batch);
                      setShowAddModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#B11C20] transition"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBatch(batch);
                    }}
                    disabled={deletingId === batch._id}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === batch._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/batch/${batch.slug || batch._id}`)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddBatchModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBatch(null);
        }}
        onSuccess={loadBatches}
        batch={editingBatch}
      />
    </div>
  );
}

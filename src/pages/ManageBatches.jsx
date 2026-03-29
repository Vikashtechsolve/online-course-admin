import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ChevronRight, Loader2 } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { getBatches } from "../utils/batchesApi";

export default function ManageBatches() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBatches();
        if (!cancelled) setBatches(data.batches || []);
      } catch (err) {
        if (!cancelled) {
          setBatches([]);
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to load batches. Check if backend is running and you are logged in.";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Manage Batches", to: "/manage-batches" },
        ]}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-slate-100 transition text-sm font-medium"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <Layers className="w-7 h-7 text-[#B11C20]" />
          Manage Batches
        </h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
        Select a batch to create courses, assign teachers and coordinators, and manage students.
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <p className="mt-2 text-xs">Ensure the backend is running and VITE_API_URL in .env matches its URL (e.g. http://localhost:8000/api).</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
        </div>
      ) : batches.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No batches available</p>
          <p className="text-slate-500 text-sm mt-1">Batches are created by Super Admin. Contact your administrator.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.filter((b) => b.isActive !== false).map((batch) => (
            <div
              key={batch._id}
              onClick={() => navigate(`/manage-batches/${batch.slug || batch._id}`)}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-red-100 cursor-pointer transition flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6 text-[#B11C20]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  {batch.name}
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </h2>
                {batch.description && (
                  <p className="text-slate-600 text-sm line-clamp-2">{batch.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

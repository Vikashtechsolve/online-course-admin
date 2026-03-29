import { useNavigate } from "react-router-dom";
import { ChevronRight, Layers } from "lucide-react";

export default function BatchCard({ batch }) {
  const navigate = useNavigate();
  const slug = batch.name.toLowerCase().split(" ")[0];

  return (
    <div
      onClick={() => navigate(`/admin/batch/${slug}`)}
      className="bg-linear-to-br from-red-50 to-white rounded-xl p-5 flex justify-between items-center border border-red-100 shadow-sm cursor-pointer hover:shadow-md hover:border-red-200 transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-[#B11C20] text-white flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900 truncate">
          {batch.name}
        </h3>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
    </div>
  );
}
import { MoreHorizontal, User, Calendar } from "lucide-react";

export default function AdminCourseCard({ course }) {
  return (
    <div className="bg-linear-to-br from-[#F2F2F2] to-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[#B11C20] font-semibold text-lg mb-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.description}
          </p>
          <div className="space-y-1.5 text-sm">
            <p className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span><span className="font-medium text-gray-800">Mentor:</span> {course.mentor}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span><span className="font-medium text-gray-800">Updated:</span> {course.updated}</span>
            </p>
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 shrink-0">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
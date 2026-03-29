import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {

  const navigate = useNavigate();

  return (
    <div className="bg-[#F2F2F2] rounded-xl p-6 soft-panel mycourses-card hover:-translate-y-0.5 transition">

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[#B11C20] text-lg font-semibold leading-tight">
          {course.title}
        </h2>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-red-100 text-[#B11C20] font-medium">
          Active
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-2">
        {course.description || "No description"}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="mycourses-stat rounded-lg px-3 py-2">
          <p className="text-[11px] text-gray-500">Students Enrolled</p>
          <p className="text-[#B11C20] font-semibold mt-0.5">{course.students ?? course.studentCount ?? 0}</p>
        </div>
        <div className="mycourses-stat rounded-lg px-3 py-2">
          <p className="text-[11px] text-gray-500">Total Lectures</p>
          <p className="text-[#B11C20] font-semibold mt-0.5">{course.lectures ?? 0}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/courses/${course._id || course.id}`)}
        className="mt-5 bg-[#2360BB] text-white px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md w-full sm:w-auto"
      >
        Manage Course →
      </button>

    </div>
  );
}
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, FileQuestion, Filter } from "lucide-react";
import AssignmentCard from "../components/AssignmentCard";
import { getAssignments } from "../utils/assignmentsApi";
import { getCourses } from "../utils/coursesApi";
import { useUser } from "../context/UserContext";

export default function Assignments() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const courseFilter = searchParams.get("course");

  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    loadCourses();
  }, [user?._id]);

  useEffect(() => {
    loadAssignments();
  }, [courseFilter, user?._id]);

  const loadCourses = async () => {
    try {
      const params = isTeacher && user?._id ? { teacher: user._id } : {};
      const data = await getCourses(params);
      setCourses(data.courses || []);
    } catch {
      setCourses([]);
    }
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (courseFilter) params.course = courseFilter;
      const data = await getAssignments(params);
      setAssignments(data.assignments || []);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold text-[#B11C20]">
          Assignments
        </h1>
        <button
          onClick={() => navigate("/assignments/create")}
          className="bg-[#B11C20] text-white px-5 py-2 rounded-lg shadow-sm hover:shadow-md"
        >
          + Add New Assignment
        </button>
      </div>

      <div className="rounded-xl px-4 py-3 bg-linear-to-r from-[#B11C200A] to-[#2360BB0D] border border-red-100 text-sm text-gray-600">
        Create assignments for your courses. All students enrolled in the course will receive the assignment automatically.
      </div>

      {courses.length > 1 && (
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select
            value={courseFilter || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v) setSearchParams({ course: v });
              else setSearchParams({});
            }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No assignments yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Create your first assignment and it will be allocated to all students in the selected course.
          </p>
          <button
            onClick={() => navigate("/assignments/create")}
            className="mt-4 px-4 py-2 rounded-lg bg-[#B11C20] text-white font-medium"
          >
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              onUpdate={loadAssignments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

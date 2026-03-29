import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, BookOpen } from "lucide-react";
import CourseCard from "../components/CourseCard";
import Breadcrumbs from "../components/Breadcrumbs";
import { getCourses } from "../utils/coursesApi";
import { useUser } from "../context/UserContext";

export default function Courses() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = user?.role === "teacher";
  const canManageBatches = ["admin", "superadmin", "coordinator"].includes(user?.role);

  useEffect(() => {
    let cancelled = false;
    const isTeacherRole = user?.role === "teacher";
    const teacherId = isTeacherRole && user?._id ? user._id : null;
    (async () => {
      setLoading(true);
      try {
        const params = teacherId ? { teacher: teacherId } : {};
        const data = await getCourses(params);
        if (!cancelled) setCourses(data.courses || []);
      } catch {
        if (!cancelled) setCourses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?._id, user?.role]);

  return (
    <div className="max-w-5xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "My Courses", to: "/courses" },
        ]}
      />

      <div className="flex justify-between items-center mb-1">
        <h1 className="text-xl text-[#B11C20] font-semibold">
          My Courses
        </h1>
        {canManageBatches && (
          <button
            onClick={() => navigate("/manage-batches")}
            className="bg-[#B11C20] text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            Manage Batches
          </button>
        )}
      </div>

      <div className="rounded-xl px-4 py-3 bg-linear-to-r from-[#B11C200A] to-[#2360BB0D] border border-red-100 text-sm text-gray-600">
        {isTeacher
          ? "Manage course content, lecture flow, and learner progress from one place."
          : "View and manage courses. Create courses and assign teachers from Manage Batches."}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">
            {isTeacher ? "No courses assigned yet" : "No courses yet"}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {isTeacher
              ? "You will see your courses here once an admin assigns you to a course."
              : "Create courses from Manage Batches or assign teachers to existing courses."}
          </p>
          {canManageBatches && (
            <button
              onClick={() => navigate("/manage-batches")}
              className="mt-4 px-4 py-2 rounded-lg bg-[#B11C20] text-white font-medium"
            >
              Go to Manage Batches
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { getBatchById, getBatches } from "../utils/batchesApi";
import { getCourses } from "../utils/coursesApi";

export default function BatchCourses() {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [batchId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(batchId);
      let batchData = null;
      if (isObjectId) {
        batchData = await getBatchById(batchId);
      } else {
        const res = await getBatches();
        batchData = res.batches?.find((b) => b.slug === batchId);
      }
      setBatch(batchData || { name: batchId });

      const coursesRes = await getCourses({ batch: batchId });
      setCourses(coursesRes.courses || []);
    } catch {
      setBatch({ name: batchId });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const batchName = batch?.name || batchId;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Super Admin Panel", to: "/admin" },
          { label: batchName },
        ]}
      />

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 text-slate-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-slate-100 transition text-sm font-medium"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#B11C20]" />
            {batchName} – Courses
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No courses in this batch</p>
          <p className="text-slate-500 text-sm mt-1">
            Use Manage Batches (Admin) to create courses, or run the seed script.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              onClick={() => navigate(`/courses/${course._id}`)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-red-100 cursor-pointer transition flex justify-between items-center"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-[#B11C20] text-lg mb-1">{course.title}</h3>
                {course.description && (
                  <p className="text-slate-600 text-sm line-clamp-2">{course.description}</p>
                )}
                <div className="flex gap-3 mt-2 text-xs text-slate-500">
                  <span>{course.lectures || 0} lectures</span>
                  <span>{course.students || 0} students</span>
                  <span>{course.teachers || 0} teachers</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

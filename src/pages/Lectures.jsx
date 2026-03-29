import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BookOpenCheck, Loader2 } from "lucide-react";
import LectureItem from "../components/LectureItem";
import AddLectureModal from "../components/AddLectureModal";
import Breadcrumbs from "../components/Breadcrumbs";
import { getLectures } from "../utils/lecturesApi";
import { getCourseById } from "../utils/coursesApi";

export default function Lectures() {
  const { id } = useParams();
  const [lectures, setLectures] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lecturesRes, courseRes] = await Promise.all([
        getLectures({ course: id }),
        getCourseById(id),
      ]);
      setLectures(lecturesRes.lectures || []);
      setCourse(courseRes);
    } catch {
      setLectures([]);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleLectureCreated = () => {
    setShowModal(false);
    loadData();
  };

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "My Courses", to: "/courses" },
          { label: course?.title || "Course", to: `/courses/${id}` },
          { label: "Lectures" },
        ]}
      />

      <div className="flex flex-wrap gap-3 justify-between items-center mb-1 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-xl text-red-600 font-semibold flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5" />
            {course?.title || "Course"} – Lectures
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage all sessions, resources, and status from one screen.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0D6BDD] text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
        >
          + Create Lecture
        </button>
      </div>

      <div className="rounded-xl px-4 py-3 bg-linear-to-r from-[#B11C200A] to-[#2360BB0D] border border-red-100 text-sm text-gray-600">
        Keep lectures organized by status and jump directly into session content.
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mycourses-card">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#B11C20]" />
          </div>
        ) : lectures.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="font-medium text-gray-700">No lectures yet</p>
            <p className="text-sm mt-1">Create your first lecture to get started.</p>
          </div>
        ) : (
          lectures.map((lecture) => (
            <LectureItem
              key={lecture._id}
              lecture={lecture}
              courseId={id}
              onDelete={loadData}
            />
          ))
        )}
      </div>

      {showModal && (
        <AddLectureModal
          courseId={id}
          closeModal={() => setShowModal(false)}
          onSuccess={handleLectureCreated}
        />
      )}
    </div>
  );
}
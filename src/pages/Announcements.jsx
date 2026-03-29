import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AnnouncementItem from "../components/AnnouncementItem";
import AnnouncementModal from "../components/AnnouncementModal";
import { Megaphone, Loader2 } from "lucide-react";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementsRead,
} from "../utils/announcementsApi";
import { getCourses } from "../utils/coursesApi";
import { getAdminUser } from "../utils/auth";

export default function Announcements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getAdminUser();
  const canCreate = user && ["superadmin", "admin", "coordinator", "teacher"].includes(user.role);
  const canDelete = canCreate;
  const unreadOnly = searchParams.get("view") === "unread";

  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [courseFilter, setCourseFilter] = useState("All");

  const loadCourses = useCallback(async () => {
    if (!user?._id) return;
    try {
      if (user.role === "coordinator") {
        const { courses: list } = await getCourses({ coordinator: user._id });
        setCourses(list || []);
      } else if (user.role === "teacher") {
        const { courses: list } = await getCourses({ teacher: user._id });
        setCourses(list || []);
      } else {
        const { courses: list } = await getCourses({});
        setCourses(list || []);
      }
    } catch {
      setCourses([]);
    }
  }, [user?._id, user?.role]);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const params =
        courseFilter !== "All" && /^[a-fA-F0-9]{24}$/.test(courseFilter)
          ? { course: courseFilter }
          : {};
      const { announcements: list } = await getAnnouncements(params);
      setAnnouncements(list);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [courseFilter]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  useEffect(() => {
    if (unreadOnly) return;
    const unreadIds = announcements.filter((a) => !a.isRead).map((a) => a._id);
    if (unreadIds.length === 0) return;
    let active = true;
    (async () => {
      try {
        await markAnnouncementsRead(unreadIds);
        if (!active) return;
        setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
        window.dispatchEvent(new Event("admin-announcements:updated"));
      } catch {
        // no-op
      }
    })();
    return () => {
      active = false;
    };
  }, [announcements, unreadOnly]);

  const displayedAnnouncements = unreadOnly
    ? announcements.filter((item) => !item.isRead)
    : announcements;

  const setAnnouncementsView = (unread) => {
    const next = new URLSearchParams(searchParams);
    if (unread) next.set("view", "unread");
    else next.delete("view");
    setSearchParams(next);
  };

  const markVisibleUnreadAsRead = async () => {
    const unreadIds = displayedAnnouncements.filter((a) => !a.isRead).map((a) => a._id);
    if (unreadIds.length === 0) return;
    try {
      await markAnnouncementsRead(unreadIds);
      setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
      window.dispatchEvent(new Event("admin-announcements:updated"));
      const next = new URLSearchParams(searchParams);
      next.delete("view");
      setSearchParams(next);
    } catch {
      // no-op
    }
  };

  const addAnnouncement = async (payload) => {
    const created = await createAnnouncement(payload);
    setAnnouncements((prev) => [{ ...created, isRead: true }, ...prev]);
    setShowModal(false);
    window.dispatchEvent(new Event("admin-announcements:updated"));
  };

  const handleEditStart = (item) => {
    setEditingAnnouncement(item);
    setShowModal(true);
  };

  const handleUpdate = async (payload) => {
    if (!editingAnnouncement?._id) return;
    const updated = await updateAnnouncement(editingAnnouncement._id, payload);
    setAnnouncements((prev) =>
      prev.map((a) => (a._id === updated._id ? { ...updated, isRead: a.isRead } : a))
    );
    setEditingAnnouncement(null);
    setShowModal(false);
    window.dispatchEvent(new Event("admin-announcements:updated"));
  };

  const handleDelete = async (id) => {
    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    window.dispatchEvent(new Event("admin-announcements:updated"));
  };

  return (
    <div className="space-y-6 max-w-4xl px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="soft-banner rounded-xl p-6 flex items-center gap-4 w-full md:w-[60%]">
          <Megaphone className="text-[#B11C20]" size={40} />
          <div>
            <h1 className="text-lg md:text-xl text-[#B11C20] font-semibold">Announcements</h1>
            <p className="text-sm text-gray-600">
              {canCreate
                ? "Create updates for students enrolled in your courses."
                : "Announcements for courses you teach."}
            </p>
          </div>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-blue-100 text-blue-600 px-5 py-3 rounded-xl w-full md:w-auto border border-blue-200 shadow-sm hover:shadow-md"
          >
            Create Announcement
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Announcements List</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setAnnouncementsView(false)}
              className={unreadOnly ? "text-slate-500 hover:text-[#B11C20]" : "font-semibold text-[#B11C20]"}
            >
              All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setAnnouncementsView(true)}
              className={unreadOnly ? "font-semibold text-[#B11C20]" : "text-slate-500 hover:text-[#B11C20]"}
            >
              Unread
            </button>
            {unreadOnly ? (
              <button
                type="button"
                onClick={markVisibleUnreadAsRead}
                className="text-xs text-slate-600 underline hover:text-[#B11C20]"
              >
                Mark all unread as seen
              </button>
            ) : null}
          </div>
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="bg-[#B11C20] text-white px-4 py-2 rounded-lg w-full sm:w-auto shadow-sm hover:shadow-md"
        >
          <option value="All">All Courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-[#B11C20]" />
        </div>
      ) : (
        <div className="space-y-4">
          {displayedAnnouncements.length === 0 ? (
            <p className="text-center text-gray-500 py-12 bg-white rounded-xl border border-gray-200">
              {unreadOnly
                ? "No unread announcements."
                : "No announcements yet."}
              {!unreadOnly && canCreate && " Create one to notify your students."}
            </p>
          ) : (
            displayedAnnouncements.map((item) => (
              <AnnouncementItem
                key={item._id}
                item={item}
                onEdit={canCreate ? handleEditStart : null}
                onDelete={canDelete ? handleDelete : null}
              />
            ))
          )}
        </div>
      )}

      {showModal && canCreate && (
        <AnnouncementModal
          closeModal={() => {
            setShowModal(false);
            setEditingAnnouncement(null);
          }}
          courses={courses}
          mode={editingAnnouncement ? "edit" : "create"}
          initialData={editingAnnouncement}
          onSubmit={editingAnnouncement ? handleUpdate : addAnnouncement}
        />
      )}
    </div>
  );
}

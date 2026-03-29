import { useCallback, useEffect, useState } from "react";
import { Bell, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearAdminAuth, getRoleLabel } from "../utils/auth";
import { useUser } from "../context/UserContext";
import { getUnreadAnnouncementsCount } from "../utils/announcementsApi";

export default function Navbar({ setIsOpen }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [announcementUnread, setAnnouncementUnread] = useState(0);

  const loadAnnouncementUnread = useCallback(async () => {
    try {
      const count = await getUnreadAnnouncementsCount();
      setAnnouncementUnread(count);
    } catch {
      setAnnouncementUnread(0);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadAnnouncementUnread();
    }, 0);
    const interval = setInterval(loadAnnouncementUnread, 30000);
    const onAnnouncementsUpdated = () => loadAnnouncementUnread();
    window.addEventListener("admin-announcements:updated", onAnnouncementsUpdated);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
      window.removeEventListener("admin-announcements:updated", onAnnouncementsUpdated);
    };
  }, [loadAnnouncementUnread]);

  const handleLogout = () => {
    clearAdminAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 min-w-[120px] sm:min-w-[150px]">
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        <h1 className="text-slate-900 text-lg sm:text-xl font-semibold">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 min-w-[120px] sm:min-w-[200px] justify-end">
        <button
          type="button"
          onClick={() =>
            navigate(
              announcementUnread > 0 ? "/announcements?view=unread" : "/announcements"
            )
          }
          className="relative cursor-pointer rounded-full border-0 bg-white p-2 app-surface sm:p-3"
          aria-label="Open unread announcements"
        >
          <Bell size={18} />
          {announcementUnread > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B11C20] px-1 text-xs font-medium text-white">
              {announcementUnread > 99 ? "99+" : announcementUnread}
            </span>
          ) : null}
        </button>

        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#B11C20] font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          )}

          <div className="leading-tight hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="text-[#B11C20]">●</span>{" "}
              {user ? getRoleLabel(user.role) : "Admin"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#B11C20]"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

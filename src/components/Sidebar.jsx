import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  Megaphone,
  LifeBuoy,
  User,
  Shield,
  X,
  Layers,
  UserPlus,
} from "lucide-react";
import SidebarActions from "./SidebarActions";
import { useUser } from "../context/UserContext";
import { getMenuForRole } from "../utils/menuByRole";

const icons = {
  dashboard: LayoutDashboard,
  courses: GraduationCap,
  assignment: ClipboardList,
  announcement: Megaphone,
  support: LifeBuoy,
  profile: User,
  admin: Shield,
  batches: Layers,
  registrations: UserPlus,
};

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { user } = useUser();
  const isDashboard = location.pathname === "/";
  const menu = getMenuForRole(user?.role || "admin");

  return (
    <div
      className={`bg-slate-50 w-[260px] h-screen px-5 fixed top-0 z-50 border-r border-slate-200 overflow-y-auto
      ${isOpen ? "left-0" : "-left-full"} lg:left-0 transition-all duration-300`}
    >
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 lg:hidden p-1 rounded-md hover:bg-slate-200"
      >
        <X size={22} />
      </button>

      <div className="-mt-4">
        <img src="/logo.png" alt="logo" className="w-40" />
      </div>

      <div className="space-y-3 mt-1">
        {menu.map((item) => {
          const Icon = icons[item.icon];
          if (!Icon) return null;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition border
                ${
                  isActive
                    ? "bg-red-50 text-[#B11C20] border-red-100 shadow-sm"
                    : "text-slate-700 border-transparent hover:bg-white hover:border-slate-200"
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </div>

      {isDashboard && (
        <div className="lg:hidden">
          <SidebarActions />
        </div>
      )}
    </div>
  );
}

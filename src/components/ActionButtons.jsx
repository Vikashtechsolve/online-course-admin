import { Link } from "react-router-dom";
import { Megaphone, Plus, Video } from "lucide-react";
import { getAdminUser } from "../utils/auth";

const baseBtn =
  "w-full flex items-center gap-3 p-3 rounded-lg text-sm border transition-shadow hover:shadow-sm text-left";

export default function ActionButtons() {
  const user = getAdminUser();
  const canPost =
    user && ["superadmin", "admin", "coordinator", "teacher"].includes(user.role);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick actions</p>

      {canPost ? (
        <>
          <Link
            to="/announcements"
            className={`${baseBtn} bg-[#0D6BDD0F] text-[#0D6BDD] border-blue-100`}
          >
            <span className="bg-[#0D6BDD20] p-1 rounded-full shrink-0">
              <Megaphone size={16} strokeWidth={2} aria-hidden />
            </span>
            Create announcement
          </Link>

          <Link
            to="/assignments/create"
            className={`${baseBtn} bg-[#D81EA20F] text-[#D81EA2] border-pink-100`}
          >
            <span className="bg-[#D81EA220] p-1 rounded-full shrink-0">
              <Plus size={16} aria-hidden />
            </span>
            Add assignment
          </Link>
        </>
      ) : null}

      <Link
        to="/courses"
        className={`${baseBtn} bg-[#B11C200F] text-[#B11C20] border-red-100`}
      >
        <span className="bg-[#B11C2020] p-1 rounded-full shrink-0">
          <Video size={16} className="text-[#B11C20]" aria-hidden />
        </span>
        Schedule live session
      </Link>
    </div>
  );
}
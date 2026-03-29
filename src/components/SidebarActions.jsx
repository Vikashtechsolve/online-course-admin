import { Megaphone, Plus, Video } from "lucide-react";

export default function SidebarActions() {
  return (
    <div className="mt-10 space-y-3">

      <button className="w-full flex items-center gap-3 bg-blue-100 text-blue-600 p-3 rounded-lg text-sm border border-blue-200 hover:shadow-sm">
        <Megaphone size={16} />
        Create Announcement
      </button>

      <button className="w-full flex items-center gap-3 bg-pink-100 text-pink-600 p-3 rounded-lg text-sm border border-pink-200 hover:shadow-sm">
        <Plus size={16} />
        Add Assignment
      </button>

      <button className="w-full flex items-center gap-3 bg-red-100 text-red-600 p-3 rounded-lg text-sm border border-red-200 hover:shadow-sm">
        <Video size={16} />
        Schedule Live Session
      </button>

    </div>
  );
}
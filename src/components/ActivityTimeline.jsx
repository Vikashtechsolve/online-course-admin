import { Loader2 } from "lucide-react";
import { formatRelativeTime } from "../utils/formatRelativeTime";

const colorMap = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  red: "bg-red-500",
  pink: "bg-pink-500",
};

export default function ActivityTimeline({ activities = [], loading }) {
  return (
    <div className="bg-[#0D6BDD0A] rounded-xl p-5 mt-5 border border-blue-100 shadow-sm">

      <h3 className="font-semibold mb-4">Recent activity</h3>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
          <span className="text-sm">Loading…</span>
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          No recent activity yet. Announcements, assignments, lectures, and support updates will show up here.
        </p>
      ) : (
      <div className="relative">

        <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-300"></div>

        <div className="space-y-6">
          {activities.map((item, index) => (
            <div key={`${item.at}-${item.type}-${index}`} className="flex items-start gap-4 relative">

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white z-10 shrink-0 ${
                  colorMap[item.color] || "bg-gray-400"
                }`}
              >
                <span className="w-2 h-2 bg-white rounded-full"></span>
              </div>

              <div className="min-w-0">
                <p className="text-sm text-gray-700 wrap-break-word">{item.title}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(item.at)}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
      )}

    </div>
  );
}
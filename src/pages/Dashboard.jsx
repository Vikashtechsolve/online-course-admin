import { useEffect, useState } from "react";
import { Ticket, ClipboardList, Video } from "lucide-react";
import { iconMap } from "../utils/iconMap";

import StatsCard from "../components/StatsCard";
import ActivityTimeline from "../components/ActivityTimeline";
import ActionButtons from "../components/ActionButtons";
import { getAdminDashboard } from "../utils/dashboardApi";

const LUCIDE_STATS = {
  tickets: Ticket,
  assignments: ClipboardList,
  lectures: Video,
};

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [headline, setHeadline] = useState({
    title: "Dashboard Overview",
    subtitle: "Here's a quick snapshot of what's happening today!",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAdminDashboard();
        if (cancelled) return;
        setStats(data.stats || []);
        setActivities(data.activities || []);
        if (data.headline?.title) {
          setHeadline({
            title: data.headline.title,
            subtitle:
              data.headline.subtitle ||
              "Here's a quick snapshot of what's happening today!",
          });
        }
      } catch {
        if (!cancelled) {
          setError("Could not load dashboard data. Try refreshing the page.");
          setStats([]);
          setActivities([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:items-start">
      <div className="space-y-6 min-w-0">
        <div className="soft-banner rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#B11C20]">{headline.title}</h2>
          <p className="text-sm text-gray-600 mt-2">{headline.subtitle}</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 text-red-800 text-sm px-4 py-3">
            {error}
          </div>
        ) : null}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 flex items-center gap-4 app-surface animate-pulse"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              ))
            : stats.map((item) => (
                <StatsCard
                  key={item.key || item.title}
                  title={item.title}
                  value={item.value}
                  icon={iconMap[item.icon]}
                  LucideIcon={LUCIDE_STATS[item.icon]}
                />
              ))}
        </div>

        {!loading && stats.length === 0 && !error ? (
          <p className="text-sm text-gray-500">No statistics available.</p>
        ) : null}
      </div>

      <aside
        className="w-full min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1 [scrollbar-gutter:stable]"
        aria-label="Quick actions and recent activity"
      >
        <ActionButtons />

        <div>
          <h3 className="font-semibold mb-1">Recent activities</h3>
          <p className="text-xs text-gray-500 mb-2">
            Latest updates from courses, support, and assignments.
          </p>
          <ActivityTimeline activities={activities} loading={loading} />
        </div>
      </aside>
    </div>
  );
}

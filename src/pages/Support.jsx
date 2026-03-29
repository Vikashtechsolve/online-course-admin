import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import TicketCard from "../components/TicketCard";
import Breadcrumbs from "../components/Breadcrumbs";
import { LifeBuoy, Loader2 } from "lucide-react";
import { fetchTickets } from "../utils/ticketsApi";

export default function Support() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [courseFilter, setCourseFilter] = useState("All");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchTickets();
      setTickets(list);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (searchParams.get("view") === "open") {
      setStatusFilter("open");
      const next = new URLSearchParams(searchParams);
      next.delete("view");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const courseOptions = useMemo(() => {
    const set = new Set();
    tickets.forEach((t) => {
      if (t.course) set.add(t.course);
    });
    return ["All", ...Array.from(set).sort()];
  }, [tickets]);

  const filteredTickets = tickets.filter((ticket) => {
    if (ticket.status !== statusFilter) return false;
    if (courseFilter !== "All" && ticket.course !== courseFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 px-4 md:px-0">
      <Breadcrumbs items={[{ label: "Support / Help", to: "/support" }]} />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="soft-banner rounded-xl p-6 w-full md:w-[60%] flex items-center gap-4">
          <LifeBuoy className="text-[#B11C20] shrink-0" size={40} />
          <div>
            <h1 className="text-lg md:text-xl text-[#B11C20] font-semibold">Support / Help</h1>
            <p className="text-gray-600 text-sm mt-1">
              View student tickets. When you send a reply, the ticket is marked resolved so the student
              can read your answer and reopen if needed.
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("open")}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              statusFilter === "open"
                ? "bg-white shadow-sm border border-red-200 text-[#B11C20]"
                : "bg-gray-100 border border-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("resolved")}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              statusFilter === "resolved"
                ? "bg-white shadow-sm border border-red-200 text-[#B11C20]"
                : "bg-gray-100 border border-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Tickets</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            onChange={(e) => setCourseFilter(e.target.value)}
            value={courseFilter}
            className="form-control py-2 w-full sm:w-auto max-w-[220px]"
          >
            {courseOptions.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Courses" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-[#B11C20]" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            <p className="font-medium text-gray-600">No {statusFilter} tickets</p>
            <p className="text-sm mt-1">Switch filter or check back later.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} />)
        )}
      </div>
    </div>
  );
}

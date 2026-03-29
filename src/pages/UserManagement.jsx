import { useNavigate } from "react-router-dom";
import { Users, UserPlus, ChevronRight, GraduationCap, UserCheck, UserCircle } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";

export default function UserManagement() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Teachers",
      description: "Enroll and manage teachers who deliver lectures.",
      icon: GraduationCap,
      path: "/users/teachers",
      color: "indigo",
    },
    {
      title: "Course Coordinators",
      description: "Add coordinators for batch and course management.",
      icon: UserCheck,
      path: "/users/coordinators",
      color: "slate",
    },
    {
      title: "Students",
      description: "Enroll students and manage their access.",
      icon: UserCircle,
      path: "/users/students",
      color: "violet",
    },
  ];

  const colorClasses = {
    indigo: "bg-red-50 border-red-100 text-[#B11C20]",
    slate: "bg-slate-50 border-slate-200 text-slate-600",
    violet: "bg-violet-50 border-violet-100 text-violet-600",
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "User Management" }]} />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-600 hover:text-[#B11C20] rounded-lg px-2 py-1.5 hover:bg-slate-100 transition text-sm font-medium"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#B11C20]" />
          User Management
        </h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
        Enroll and manage teachers, course coordinators, and students.
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.path}
              onClick={() => navigate(card.path)}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-red-100 cursor-pointer transition flex items-start gap-4"
            >
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${colorClasses[card.color]}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  {card.title}
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </h2>
                <p className="text-slate-600 text-sm">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

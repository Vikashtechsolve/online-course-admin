export default function StatsCard({ title, value, icon, LucideIcon }) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-center gap-4 app-surface hover:shadow-md">
      
      <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-100 to-blue-100 flex items-center justify-center border border-red-100 shrink-0">
        {LucideIcon ? (
          <LucideIcon className="w-5 h-5 text-[#B11C20]" strokeWidth={1.75} aria-hidden />
        ) : icon ? (
          <img src={icon} alt="" className="w-5 h-5 object-contain" />
        ) : null}
      </div>

      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <h2 className="text-xl font-semibold">{value}</h2>
      </div>

    </div>
  );
}
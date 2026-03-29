import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mb-3">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="hover:text-[#B11C20] hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[#B11C20] font-medium" : ""}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 text-gray-400" />}
          </div>
        );
      })}
    </nav>
  );
}

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { formatDate } from "../utils/date";

export default function AnnouncementItem({ item, onEdit, onDelete }) {
  const [openMenu, setOpenMenu] = useState(false);

  const courseTitle = item.course?.title || "Course";
  const batchName = item.course?.batch?.name;

  return (
    <div className="bg-linear-to-br from-[#F2F2F2] to-[#FFFFFF] rounded-xl p-6 flex justify-between items-start relative soft-panel border border-gray-200 hover:shadow-md transition">
      <div className="pr-3 min-w-0 flex-1">
        <div className="flex items-start gap-2 mb-2 flex-wrap">
          <h2 className="text-red-600 font-semibold text-lg leading-tight">{item.title}</h2>
          {item.isRead === false ? (
            <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
              New
            </span>
          ) : null}
          <span className="text-[11px] font-medium bg-white border border-blue-200 text-[#2360BB] px-2.5 py-1 rounded-full shrink-0">
            {courseTitle}
            {batchName ? ` · ${batchName}` : ""}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 leading-relaxed whitespace-pre-wrap">{item.body}</p>

        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">Posted:</span> {formatDate(item.createdAt)}
          {item.author?.name ? (
            <>
              {" "}
              · <span className="font-medium text-gray-700">By</span> {item.author.name}
            </>
          ) : null}
        </p>
      </div>

      {onEdit || onDelete ? (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpenMenu(!openMenu)}
            className="text-blue-600 p-1 rounded-md hover:bg-blue-50"
            aria-label="Actions"
          >
            <MoreHorizontal size={20} />
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-2 bg-white shadow-md rounded-lg border border-gray-200 min-w-28 z-10">
              {onEdit ? (
                <button
                  type="button"
                  onClick={() => {
                    onEdit(item);
                    setOpenMenu(false);
                  }}
                  className="px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                >
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  onDelete(item._id);
                  setOpenMenu(false);
                }}
                className="px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

const DATE_OPTS = { day: "numeric", month: "short", year: "numeric" };
const DATETIME_OPTS = { ...DATE_OPTS, hour: "2-digit", minute: "2-digit" };

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", DATE_OPTS);
}

export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", DATETIME_OPTS);
}

export function formatDateForInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

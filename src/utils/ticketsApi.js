import api from "./api";
import { formatDateTime } from "./date";

export { formatDateTime as formatTicketDate };

export async function getOpenTicketsCount() {
  const { data } = await api.get("/tickets/open-count");
  return data.count ?? 0;
}

export async function fetchTickets(params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams ? `/tickets?${searchParams}` : "/tickets";
  const { data } = await api.get(url);
  return data.tickets || [];
}

export async function fetchTicket(id) {
  const { data } = await api.get(`/tickets/${id}`);
  return data.ticket;
}

export async function staffReply(ticketId, text) {
  const { data } = await api.post(`/tickets/${ticketId}/staff-reply`, { text });
  return data.ticket;
}

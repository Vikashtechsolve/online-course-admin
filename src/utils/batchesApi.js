import api from "./api";

export async function getBatches(params = {}) {
  const searchParams = new URLSearchParams(params).toString();
  const url = searchParams ? `/batches?${searchParams}` : "/batches";
  const { data } = await api.get(url);
  return data;
}

export async function createBatch(batchData) {
  const { data } = await api.post("/batches", batchData);
  return data.batch;
}

export async function getBatchById(id) {
  const { data } = await api.get(`/batches/${id}`);
  return data.batch;
}

export async function updateBatch(id, updates) {
  const { data } = await api.put(`/batches/${id}`, updates);
  return data.batch;
}

export async function deleteBatch(id) {
  await api.delete(`/batches/${id}`);
}

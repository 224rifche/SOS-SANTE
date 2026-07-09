import apiClient from "./apiClient";

const PENDING_ALERTS_KEY = "wonmally_pending_alerts";

function getPendingAlerts() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_ALERTS_KEY)) || [];
  } catch {
    return [];
  }
}

function savePendingAlerts(list) {
  localStorage.setItem(PENDING_ALERTS_KEY, JSON.stringify(list));
}

export const alertService = {
  async createAlert(payload) {
    try {
      const { data } = await apiClient.post("/alerts", payload);
      return { queued: false, data };
    } catch (err) {
      const isNetworkError = !err.response;
      if (isNetworkError) {
        const pending = getPendingAlerts();
        const queuedAlert = { ...payload, queuedAt: new Date().toISOString() };
        pending.push(queuedAlert);
        savePendingAlerts(pending);
        return { queued: true, data: queuedAlert };
      }
      throw err;
    }
  },
  getPendingAlertsCount() {
    return getPendingAlerts().length;
  },
  async flushPendingAlerts() {
    const pending = getPendingAlerts();
    if (pending.length === 0) return { sent: 0, remaining: 0 };
    const stillPending = [];
    let sentCount = 0;
    for (const alert of pending) {
      try {
        const { queuedAt, ...payload } = alert;
        await apiClient.post("/alerts", payload);
        sentCount += 1;
      } catch {
        stillPending.push(alert);
      }
    }
    savePendingAlerts(stillPending);
    return { sent: sentCount, remaining: stillPending.length };
  },
  async getMyAlerts() {
    const { data } = await apiClient.get("/alerts/me");
    return data;
  },
  async getAlertById(id) {
    const { data } = await apiClient.get(`/alerts/${id}`);
    return data;
  },
  async listAll(status) {
    const { data } = await apiClient.get("/alerts", { params: { status } });
    return data;
  },
  async updateStatus(id, status) {
    const { data } = await apiClient.patch(`/alerts/${id}/status`, { status });
    return data;
  },
};
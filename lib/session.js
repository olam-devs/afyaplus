// In-memory session store — no external database required
const sessions = new Map();
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours (for daily reminders)

async function getSession(userId) {
  const s = sessions.get(userId);
  if (!s) return null;
  if (Date.now() - s.timestamp > SESSION_TTL) {
    sessions.delete(userId);
    return null;
  }
  return s;
}

async function setSession(userId, data) {
  sessions.set(userId, { ...data, timestamp: Date.now() });
}

async function clearSession(userId) {
  sessions.delete(userId);
}

async function getAllActiveSessions() {
  const result = [];
  for (const [id, s] of sessions) {
    if (s.state) result.push({ userId: id, ...s });
  }
  return result;
}

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessions) {
    if (now - v.timestamp > SESSION_TTL) sessions.delete(k);
  }
}, 60 * 1000);

module.exports = { getSession, setSession, clearSession, getAllActiveSessions };

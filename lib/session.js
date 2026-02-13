// In-memory session store for booking flow
// For production, replace with a database (e.g., Vercel KV, Redis, MongoDB)
const sessions = new Map();
const SESSION_TTL = 10 * 60 * 1000; // 10 minutes

function getSession(userId) {
  const session = sessions.get(userId);
  if (!session) return null;
  if (Date.now() - session.timestamp > SESSION_TTL) {
    sessions.delete(userId);
    return null;
  }
  return session;
}

function setSession(userId, data) {
  sessions.set(userId, { ...data, timestamp: Date.now() });
}

function clearSession(userId) {
  sessions.delete(userId);
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of sessions) {
    if (now - val.timestamp > SESSION_TTL) sessions.delete(key);
  }
}, 60 * 1000);

module.exports = { getSession, setSession, clearSession };

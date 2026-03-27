// Guard: if the env var is missing the protocol (e.g. set without https://)
// the browser treats it as a relative path — always enforce absolute URL.
const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = raw.startsWith("http") ? raw : `https://${raw}`;

export const API_ENDPOINTS = {
  assess:       `${API_BASE_URL}/api/assess`,
  assessDomain: `${API_BASE_URL}/api/assess/domain`,
  reportPdf:    `${API_BASE_URL}/api/report/pdf`,
  user:         (uid: string) => `${API_BASE_URL}/api/user/${uid}`,
  userMeta:     (uid: string) => `${API_BASE_URL}/api/user/${uid}/meta`,
  userReset:    (uid: string) => `${API_BASE_URL}/api/user/${uid}/reset`,
  chat:         `${API_BASE_URL}/api/chat`,
  chatHistory:  (uid: string) => `${API_BASE_URL}/api/chat/${uid}`,
};

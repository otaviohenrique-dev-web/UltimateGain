export function backendHttpBase() {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api) return api.replace(/\/$/, "");
  const ws = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:10000/ws";
  return ws
    .replace(/^wss:\/\//i, "https://")
    .replace(/^ws:\/\//i, "http://")
    .replace(/\/ws\/?$/i, "");
}

export function backendWsUrl() {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api) {
    const u = api.replace(/\/$/, "");
    const host = u.includes("://") ? u.split("://")[1] : u;
    if (/^https:/i.test(u)) return `wss://${host}/ws`;
    return `ws://${host}/ws`;
  }
  return "ws://127.0.0.1:10000/ws";
}
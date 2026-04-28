export function backendHttpBase() {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api) return api.replace(/\/$/, "");
  return "http://127.0.0.1:10000";
}

export function backendWsUrl() {
  const wsEnv = process.env.NEXT_PUBLIC_WS_URL;
  if (wsEnv) return wsEnv;
  
  return "ws://127.0.0.1:10000/ws";
}

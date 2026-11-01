export const APP_NAME = "Humzubaan";

export function getHealthStatus() {
  return {
    status: "ok",
    app: APP_NAME,
    time: new Date().toISOString(),
  };
}
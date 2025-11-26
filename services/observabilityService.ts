import api from "./http";

type EventPayload = Record<string, unknown>;

export async function trackEvent(
  name: string,
  payload: EventPayload = {},
): Promise<void> {
  try {
    await api.post("/frontend/events", {
      name,
      payload,
      ts: new Date().toISOString(),
      source: "client",
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("trackEvent failed", e);
    }
  }
}

export async function reportError(
  error: unknown,
  context: { component?: string; extra?: EventPayload } = {},
): Promise<void> {
  try {
    await api.post("/frontend/errors", {
      message:
        error instanceof Error ? error.message : "Unknown frontend error",
      stack: error instanceof Error ? error.stack : undefined,
      component: context.component,
      extra: context.extra,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("reportError failed", e);
    }
  }
}



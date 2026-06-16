import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableLogs: true,
  integrations: [Sentry.replayIntegration()],
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

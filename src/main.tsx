
  import { createRoot } from "react-dom/client";
  import "./i18n";
  import App from "./App.tsx";
  import "./index.css";
  import { getAppConfig } from "./services/appConfigApi";
  import { injectGtm } from "./utils/injectGtm";

  createRoot(document.getElementById("root")!).render(<App />);

  // Inject the Google Tag Manager snippets configured in the dashboard
  // (App Configuration → Google Tag Manager). Best-effort: never blocks the app.
  const GTM_CACHE_KEY = "adcc.appConfig.v1";
  try {
    const cached = localStorage.getItem(GTM_CACHE_KEY);
    if (cached) injectGtm(JSON.parse(cached)?.gtm);
  } catch {
    // ignore cache/parse errors
  }
  getAppConfig()
    .then((config) => injectGtm(config.gtm))
    .catch(() => {
      // analytics is non-critical — ignore load failures
    });

  import { createRoot } from "react-dom/client";
  import "./i18n";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);

  // The Google Tag Manager / tracking / chat code configured in the dashboard
  // (App Configuration → Google Tag Manager) is loaded by PublicLayout, so it
  // runs on the public website only and never on the admin dashboard.

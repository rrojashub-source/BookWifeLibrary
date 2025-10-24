import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./lib/pwa-utils";

// Registrar Service Worker para PWA
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);

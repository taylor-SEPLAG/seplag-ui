import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ToastProviderSeplag } from "./provider/printToast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ToastProviderSeplag>
        <App />
      </ToastProviderSeplag>
    </HashRouter>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { DatasetProvider } from "./features/dataset/DatasetContext";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DatasetProvider><App /></DatasetProvider>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { DatasetProvider } from "./features/dataset/DatasetContext";
import { TrainingProvider } from "./features/training/TrainingContext";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DatasetProvider><TrainingProvider><App /></TrainingProvider></DatasetProvider>
  </StrictMode>,
);

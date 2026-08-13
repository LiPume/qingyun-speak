import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { QuestionsPage } from "../pages/QuestionsPage";
import { QuestionDetailPage } from "../pages/QuestionDetailPage";
import { PronunciationPage } from "../pages/PronunciationPage";
import { SettingsPage } from "../pages/SettingsPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function App() {
  return <HashRouter><Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="/question/:questionId" element={<QuestionDetailPage />} />
      <Route path="/pronunciation" element={<PronunciationPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  </Routes></HashRouter>;
}

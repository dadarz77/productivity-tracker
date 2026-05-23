import { Routes, Route } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewDecision from "./pages/NewDecision";
import DecisionAnalysisPage from "./pages/DecisionAnalysisPage";
import MyDecisions from "./pages/MyDecisions";
import ProgressPage from "./pages/ProgressPage";
import AIAdvisor from "./pages/AIAdvisor";
import ForumPage from "./pages/ForumPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="decisionpilot-theme">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-decision" element={<NewDecision />} />
        <Route path="/decisions" element={<MyDecisions />} />
        <Route path="/analysis/:id" element={<DecisionAnalysisPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

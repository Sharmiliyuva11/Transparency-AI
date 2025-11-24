import { Navigate, Route, Routes } from "react-router-dom";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Overview from "./pages/employee/Overview";
import Upload from "./pages/employee/Upload";
import Expenses from "./pages/employee/Expenses";
import Assistant from "./pages/employee/Assistant";
import Settings from "./pages/employee/Settings";
import Reports from "./pages/employee/Reports";
import AnomalyDetection from "./pages/employee/AnomalyDetection";
import AdminDashboardWrapper from "./pages/admin/AdminDashboardWrapper";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminAssistant from "./pages/admin/AdminAssistant";
import AdminUpload from "./pages/admin/AdminUpload";
import AdminSettings from "./pages/admin/AdminSettings";
import ExpenseCategories from "./pages/admin/ExpenseCategories";
import AdminAnomalyDetection from "./pages/admin/AnomalyDetection";
import UserManagement from "./pages/admin/UserManagement";
import AdminReports from "./pages/admin/Reports";
import AIInsights from "./pages/admin/AIInsights";
import AuditorDashboardWrapper from "./pages/auditor/AuditorDashboardWrapper";
import AuditorOverview from "./pages/auditor/AuditorOverview";
import AllExpenses from "./pages/auditor/AllExpenses";
import AuditorAnomalyDetection from "./pages/auditor/AnomalyDetection";
import AuditorAuditTrail from "./pages/auditor/AuditTrail";
import AuditorAIInsights from "./pages/auditor/AIInsights";
import AuditorReports from "./pages/auditor/Reports";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard/admin" element={<AdminDashboardWrapper />}>
        <Route index element={<AdminOverview />} />
        <Route path="upload" element={<AdminUpload />} />
        <Route path="assistant" element={<AdminAssistant />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="categories" element={<ExpenseCategories />} />
        <Route path="anomaly-detection" element={<AdminAnomalyDetection />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="ai-insights" element={<AIInsights />} />
      </Route>
      <Route path="/dashboard/auditor" element={<AuditorDashboardWrapper />}>
        <Route index element={<AuditorOverview />} />
        <Route path="all-expenses" element={<AllExpenses />} />
        <Route path="anomaly-detection" element={<AuditorAnomalyDetection />} />
        <Route path="reports" element={<AuditorReports />} />
        <Route path="audit-trail" element={<AuditorAuditTrail />} />
        <Route path="ai-insights" element={<AuditorAIInsights />} />
      </Route>
      <Route path="/dashboard/employee" element={<EmployeeDashboard />}>
        <Route index element={<Overview />} />
        <Route path="upload" element={<Upload />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="reports" element={<Reports />} />
        <Route path="anomaly-detection" element={<AnomalyDetection />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

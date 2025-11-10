import { Navigate, Route, Routes } from "react-router-dom";
import AuditorDashboard from "./pages/AuditorDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import LoginPage from "./pages/LoginPage";
import Overview from "./pages/employee/Overview";
import Upload from "./pages/employee/Upload";
import Expenses from "./pages/employee/Expenses";
import Assistant from "./pages/employee/Assistant";
import Settings from "./pages/employee/Settings";
import AdminDashboardWrapper from "./pages/admin/AdminDashboardWrapper";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminAssistant from "./pages/admin/AdminAssistant";
import AdminUpload from "./pages/admin/AdminUpload";
import AdminSettings from "./pages/admin/AdminSettings";
import ExpenseCategories from "./pages/admin/ExpenseCategories";
import AnomalyDetection from "./pages/admin/AnomalyDetection";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard/admin" element={<AdminDashboardWrapper />}>
        <Route index element={<AdminOverview />} />
        <Route path="upload" element={<AdminUpload />} />
        <Route path="assistant" element={<AdminAssistant />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="categories" element={<ExpenseCategories />} />
        <Route path="anomaly-detection" element={<AnomalyDetection />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="/dashboard/auditor" element={<AuditorDashboard />} />
      <Route path="/dashboard/employee" element={<EmployeeDashboard />}>
        <Route index element={<Overview />} />
        <Route path="upload" element={<Upload />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

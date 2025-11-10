import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import LoginPage from "./pages/LoginPage";
import Overview from "./pages/employee/Overview";
import Upload from "./pages/employee/Upload";
import Expenses from "./pages/employee/Expenses";
import Assistant from "./pages/employee/Assistant";
import Settings from "./pages/employee/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
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

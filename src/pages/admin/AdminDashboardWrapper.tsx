import { Outlet } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiFolder,
  FiGrid,
  FiList,
  FiPieChart,
  FiSettings,
  FiUploadCloud,
  FiUserCheck
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa6";

export default function AdminDashboardWrapper() {
  return (
    <DashboardLayout
      appName="AI Expense Transparency"
      sidebarLinks={[
        { label: "Dashboard Overview", icon: <FiGrid />, path: "/dashboard/admin" },
        { label: "Upload Receipt", icon: <FiUploadCloud />, path: "/dashboard/admin/upload" },
        { label: "AI Assistant", icon: <FaRobot />, path: "/dashboard/admin/assistant" },
        { label: "Settings", icon: <FiSettings />, path: "/dashboard/admin/settings" },
        { label: "Expense Categories", icon: <FiPieChart />, path: "/dashboard/admin/categories" },
        { label: "Anomaly Detection", icon: <FiActivity />, path: "/dashboard/admin/anomaly-detection" },
        { label: "Reports", icon: <FiBarChart2 />, path: "/dashboard/admin/reports" },
        { label: "User Management", icon: <FiUserCheck />, path: "/dashboard/admin/user-management" },
        { label: "AI Insights", icon: <FiBookOpen />, path: "/dashboard/admin/ai-insights" }
      ]}
      footerLinks={[]}
      title="Smart Auditor AI"
      subtitle="Conversational insights to keep your spend compliant"
      userName="Admin User"
      userRole="Admin"
    >
      <Outlet />
    </DashboardLayout>
  );
}
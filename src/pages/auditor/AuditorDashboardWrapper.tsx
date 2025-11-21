import { Outlet } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import type { ReactElement } from "react";
import {
  FiActivity,
  FiArchive,
  FiBarChart2,
  FiBookOpen,
  FiGrid,
  FiLayers,
  FiShield,
  FiTrendingUp
} from "react-icons/fi";

export default function AuditorDashboardWrapper(): ReactElement {
  return (
    <DashboardLayout
      appName="AI Expense Transparency"
      sidebarLinks={[
        { label: "Dashboard Overview", icon: <FiGrid />, path: "/dashboard/auditor" },
        { label: "All Expenses", icon: <FiArchive />, path: "/dashboard/auditor/all-expenses" },
        { label: "Anomaly Review", icon: <FiActivity /> },
        { label: "Reports", icon: <FiBarChart2 /> },
        { label: "Audit Trail", icon: <FiLayers /> },
        { label: "AI Insights", icon: <FiBookOpen /> },
        { label: "Settings", icon: <FiShield /> }
      ]}
      footerLinks={[{ label: "Trends", icon: <FiTrendingUp /> }]}
      title="Auditor Dashboard"
      subtitle="Review and monitor expense activities"
      userName="Admin User"
      userRole="Auditor"
    >
      <Outlet />
    </DashboardLayout>
  );
}
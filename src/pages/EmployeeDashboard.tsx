import { ReactNode, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { FiFileText, FiFolder, FiGrid, FiSettings, FiUploadCloud } from "react-icons/fi";

type PageConfig = {
  key: string;
  label: string;
  icon: ReactNode;
  path: string;
  title: string;
  subtitle: string;
};

const pages: PageConfig[] = [
  {
    key: "overview",
    label: "Dashboard Overview",
    icon: <FiGrid />,
    path: "/dashboard/employee",
    title: "My Expense Dashboard",
    subtitle: "Track and manage your personal expenses"
  },
  {
    key: "upload",
    label: "Upload Receipt",
    icon: <FiUploadCloud />,
    path: "/dashboard/employee/upload",
    title: "Upload Expense Document",
    subtitle: "AI powered OCR will extract data automatically"
  },
  {
    key: "expenses",
    label: "My Expenses",
    icon: <FiFolder />,
    path: "/dashboard/employee/expenses",
    title: "Expense History",
    subtitle: "Review submissions and AI status in one place"
  },
  {
    key: "settings",
    label: "Settings",
    icon: <FiSettings />,
    path: "/dashboard/employee/settings",
    title: "Workspace Preferences",
    subtitle: "Customize notifications, AI automation, and policies"
  }
];

export default function EmployeeDashboard() {
  const location = useLocation();
  const activePage = useMemo(() => {
    const exact = pages.find((page) => location.pathname === page.path);
    if (exact) {
      return exact;
    }
    return pages.find((page) => location.pathname.startsWith(`${page.path}/`)) ?? pages[0];
  }, [location.pathname]);

  return (
    <DashboardLayout
      appName="AI Expense Transparency"
      sidebarLinks={pages.map(({ label, icon, path }) => ({ label, icon, path }))}
      footerLinks={[{ label: "Reports", icon: <FiFileText /> }]}
      title={activePage.title}
      subtitle={activePage.subtitle}
      userName="Employee User"
      userRole="Employee"
    >
      <Outlet />
    </DashboardLayout>
  );
}

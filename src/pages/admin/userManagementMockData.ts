// Mock data for user management page

// Type definitions
export interface UserManagementProps {
  adminUsersCount: number;
  staffEmployeesCount: number;
  auditorsCount: number;
  users: User[];
  rolePermissions: RolePermissions;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: "Finance" | "Marketing" | "Engineering" | "Compliance" | "Sales" | "Operations" | "HR";
  role: "Admin" | "User" | "Auditor";
  status: "Active" | "Inactive" | "Pending";
  joinedDate: Date;
}

export interface RolePermissions {
  admin: string[];
  user: string[];
  auditor: string[];
}

export const mockUserManagementProps: UserManagementProps = {
  adminUsersCount: 1,
  staffEmployeesCount: 5,
  auditorsCount: 1,
  
  users: [
    {
      id: "user-1",
      name: "John Smith",
      email: "john.smith@example.com",
      department: "Finance" as const,
      role: "Admin" as const,
      status: "Active" as const,
      joinedDate: new Date("2024-01-15")
    },
    {
      id: "user-2",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      department: "Marketing" as const,
      role: "User" as const,
      status: "Active" as const,
      joinedDate: new Date("2024-02-20")
    },
    {
      id: "user-3",
      name: "Mike Chen",
      email: "mike.chen@example.com",
      department: "Engineering" as const,
      role: "User" as const,
      status: "Active" as const,
      joinedDate: new Date("2024-01-10")
    },
    {
      id: "user-4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      department: "Compliance" as const,
      role: "Auditor" as const,
      status: "Active" as const,
      joinedDate: new Date("2024-01-05")
    },
    {
      id: "user-5",
      name: "Robert Brown",
      email: "robert.brown@example.com",
      department: "Sales" as const,
      role: "User" as const,
      status: "Inactive" as const,
      joinedDate: new Date("2024-04-12")
    },
    {
      id: "user-6",
      name: "Lisa Anderson",
      email: "lisa.anderson@example.com",
      department: "Operations" as const,
      role: "User" as const,
      status: "Active" as const,
      joinedDate: new Date("2024-05-18")
    },
    {
      id: "user-7",
      name: "David Walker",
      email: "david.walker@example.com",
      department: "HR" as const,
      role: "User" as const,
      status: "Pending" as const,
      joinedDate: new Date("2025-03-25")
    }
  ],
  
  rolePermissions: {
    admin: [
      "View all expenses organization-wide",
      "Approve/reject flagged transactions",
      "Access audit logs",
      "Generate and export reports",
      "Configure system settings"
    ],
    user: [
      "Submit expense receipts",
      "View personal expense history",
      "Track approval status",
      "Edit personal profile"
    ],
    auditor: [
      "Read-only access to all data",
      "View all dashboards and reports",
      "Generate compliance reports",
      "Verify transaction legitimacy"
    ]
  }
};
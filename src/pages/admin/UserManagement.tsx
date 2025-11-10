import { useState } from "react";
import { UserRound, Users, SearchCheck, Search } from "lucide-react";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import type { UserManagementProps, User } from "./userManagementMockData";
import { mockUserManagementProps } from "./userManagementMockData";
import { formatDate } from "./userManagementUtils";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: `${color}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color
          }}
        >
          {icon}
        </div>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ fontSize: "32px" }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: "Active" | "Inactive" | "Pending";
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses: Record<string, string> = {
    Active: "badge green",
    Inactive: "badge red",
    Pending: "badge yellow"
  };

  return <span className={statusClasses[status]}>{status}</span>;
}

interface RoleBadgeProps {
  role: "Admin" | "User" | "Auditor";
}

function RoleBadge({ role }: RoleBadgeProps) {
  const roleColors: Record<string, string> = {
    Admin: "badge red",
    User: "badge blue",
    Auditor: "badge yellow"
  };

  return <span className={roleColors[role]}>{role}</span>;
}

interface UserTableRowProps {
  user: User;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function UserTableRow({ user, onView, onEdit, onDelete }: UserTableRowProps) {
  return (
    <tr>
      <td>{user.name}</td>
      <td style={{ color: "var(--accent-blue)" }}>{user.email}</td>
      <td>{user.department}</td>
      <td>
        <RoleBadge role={user.role} />
      </td>
      <td>
        <StatusBadge status={user.status} />
      </td>
      <td>{formatDate(user.joinedDate)}</td>
      <td>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => onView(user.id)}
            className="icon-button"
            style={{ width: "32px", height: "32px" }}
            title="View"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => onEdit(user.id)}
            className="icon-button"
            style={{ width: "32px", height: "32px" }}
            title="Edit"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="icon-button"
            style={{ width: "32px", height: "32px" }}
            title="Delete"
          >
            <FiTrash2 size={16} color="var(--logout-color)" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface RolePermissionCardProps {
  title: string;
  permissions: string[];
  color: string;
}

function RolePermissionCard({ title, permissions, color }: RolePermissionCardProps) {
  return (
    <div className="section-card" style={{ borderColor: color }}>
      <div className="section-header">
        <h3>{title}</h3>
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
        {permissions.map((permission, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "14px",
              color: "var(--text-secondary)"
            }}
          >
            <span style={{ color: color, marginTop: "2px" }}>•</span>
            <span>{permission}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UserManagement() {
  const data: UserManagementProps = mockUserManagementProps;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = data.users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (id: string) => {
    console.log("View user:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit user:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete user:", id);
  };

  const handleAddUser = () => {
    console.log("Add new user");
  };

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <h2 className="dashboard-title">User Management</h2>
        <p className="dashboard-subtitle">Manage organization members and their permissions</p>
      </div>

      <div className="grid cols-3">
        <MetricCard
          icon={<UserRound size={24} />}
          label="Admin Users"
          value={data.adminUsersCount}
          color="#3ba8ff"
        />
        <MetricCard
          icon={<Users size={24} />}
          label="Staff/Employees"
          value={data.staffEmployeesCount}
          color="#38d788"
        />
        <MetricCard
          icon={<SearchCheck size={24} />}
          label="Auditors"
          value={data.auditorsCount}
          color="#ffa94d"
        />
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Organization Users ({filteredUsers.length})</h3>
          <button className="primary-button" onClick={handleAddUser}>
            Add New User
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: "18px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)"
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "44px" }}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Role Permissions Overview</h3>
        </div>
        <div className="grid cols-3">
          <RolePermissionCard
            title="Admin"
            permissions={data.rolePermissions.admin}
            color="#3ba8ff"
          />
          <RolePermissionCard
            title="User (Staff/Employee)"
            permissions={data.rolePermissions.user}
            color="#38d788"
          />
          <RolePermissionCard
            title="Auditor"
            permissions={data.rolePermissions.auditor}
            color="#ffa94d"
          />
        </div>
      </div>
    </>
  );
}
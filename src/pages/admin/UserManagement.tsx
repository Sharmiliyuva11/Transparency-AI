import { useState, useEffect } from "react";
import { UserRound, Users, SearchCheck, Search } from "lucide-react";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import type { UserManagementProps, User } from "./userManagementMockData";
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
  const [data, setData] = useState<UserManagementProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", department: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", department: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/users");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setData({
          adminUsersCount: result.adminUsersCount,
          staffEmployeesCount: result.staffEmployeesCount,
          auditorsCount: result.auditorsCount,
          users: result.users.map((u: any) => ({
            ...u,
            joinedDate: new Date(u.joinedDate)
          })),
          rolePermissions: result.rolePermissions
        });
      } else {
        throw new Error(result.error || "Failed to fetch user data");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user data";
      setError(errorMessage);
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!newUserForm.name || !newUserForm.email) {
      setSubmitError("Name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newUserForm.name,
          email: newUserForm.email,
          department: newUserForm.department || "General"
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      setSuccessMessage("User created successfully!");
      setNewUserForm({ name: "", email: "", department: "" });
      setShowAddUserModal(false);
      
      setTimeout(() => {
        fetchUserData();
        setSuccessMessage(null);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user";
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading users...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "var(--logout-color)" }}>Error: {error || "No data available"}</p>
      </div>
    );
  }

  const filteredUsers = data.users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (id: string) => {
    const user = data?.users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setShowViewModal(true);
    }
  };

  const handleEdit = (id: string) => {
    const user = data?.users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setEditForm({ name: user.name, email: user.email, department: user.department });
      setShowEditModal(true);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`http://localhost:5000/api/admin/users/${deleteConfirm}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      setSuccessMessage("User deleted successfully!");
      setDeleteConfirm(null);
      
      setTimeout(() => {
        fetchUserData();
        setSuccessMessage(null);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user";
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!editForm.name || !editForm.email) {
      setSubmitError("Name and email are required");
      return;
    }

    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          department: editForm.department
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      setSuccessMessage("User updated successfully!");
      setShowEditModal(false);
      
      setTimeout(() => {
        fetchUserData();
        setSuccessMessage(null);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
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
          <button className="primary-button" onClick={() => setShowAddUserModal(true)}>
            Add New User
          </button>
        </div>

        {successMessage && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "16px",
            background: "#0f2e1b",
            border: "1px solid #38d788",
            borderRadius: "8px",
            color: "#38d788",
            fontSize: "14px"
          }}>
            {successMessage}
          </div>
        )}

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

      {showViewModal && selectedUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid rgba(71,102,190,0.45)"
          }}>
            <h3 style={{ marginBottom: "20px", color: "var(--text-primary)" }}>User Details</h3>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                Name
              </label>
              <div style={{ padding: "10px 12px", background: "var(--bg-primary)", borderRadius: "6px", color: "var(--text-primary)" }}>
                {selectedUser.name}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                Email
              </label>
              <div style={{ padding: "10px 12px", background: "var(--bg-primary)", borderRadius: "6px", color: "var(--text-primary)" }}>
                {selectedUser.email}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                Department
              </label>
              <div style={{ padding: "10px 12px", background: "var(--bg-primary)", borderRadius: "6px", color: "var(--text-primary)" }}>
                {selectedUser.department}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                Role
              </label>
              <div style={{ padding: "10px 12px", background: "var(--bg-primary)", borderRadius: "6px", color: "var(--text-primary)" }}>
                <RoleBadge role={selectedUser.role} />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                Status
              </label>
              <div style={{ padding: "10px 12px", background: "var(--bg-primary)", borderRadius: "6px", color: "var(--text-primary)" }}>
                <StatusBadge status={selectedUser.status} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid rgba(71,102,190,0.45)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid rgba(71,102,190,0.45)"
          }}>
            <h3 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>Edit User</h3>
            
            {submitError && (
              <div style={{
                padding: "10px 12px",
                marginBottom: "16px",
                background: "#2e1415",
                border: "1px solid #ff6b6b",
                borderRadius: "6px",
                color: "#ff6b6b",
                fontSize: "13px"
              }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field"
                  style={{ width: "100%" }}
                  disabled={submitting}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="input-field"
                  style={{ width: "100%" }}
                  disabled={submitting}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Enter department"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="input-field"
                  style={{ width: "100%" }}
                  disabled={submitting}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid rgba(71,102,190,0.45)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid rgba(71,102,190,0.45)"
          }}>
            <h3 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>Delete User</h3>
            
            <p style={{ marginBottom: "20px", color: "var(--text-secondary)" }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>

            {submitError && (
              <div style={{
                padding: "10px 12px",
                marginBottom: "16px",
                background: "#2e1415",
                border: "1px solid #ff6b6b",
                borderRadius: "6px",
                color: "#ff6b6b",
                fontSize: "13px"
              }}>
                {submitError}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid rgba(71,102,190,0.45)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#ff6b6b",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500
                }}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid rgba(71,102,190,0.45)"
          }}>
            <h3 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>Add New User</h3>
            
            {submitError && (
              <div style={{
                padding: "10px 12px",
                marginBottom: "16px",
                background: "#2e1415",
                border: "1px solid #ff6b6b",
                borderRadius: "6px",
                color: "#ff6b6b",
                fontSize: "13px"
              }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="input-field"
                  style={{ width: "100%" }}
                  disabled={submitting}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="input-field"
                  style={{ width: "100%" }}
                  disabled={submitting}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Enter department (optional)"
                  value={newUserForm.department}
                  onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                  className="input-field"
                  style={{ width: "100%" }}
                  disabled={submitting}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid rgba(71,102,190,0.45)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
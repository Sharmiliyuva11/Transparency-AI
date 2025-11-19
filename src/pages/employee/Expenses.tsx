import { useState, useEffect } from "react";
import { useExpenseRefresh } from "../../context/ExpenseContext";

const statusBadges: Record<string, string> = {
  Approved: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red",
  "Processed": "badge green",
  "Needs Review": "badge yellow"
};

const aiBadges: Record<string, string> = {
  Clean: "badge green",
  Review: "badge yellow",
  Anomaly: "badge red"
};

interface Expense {
  id: number;
  file: string;
  uploadedAt: string;
  category: string;
  vendor: string;
  total: number;
  textPreview: string;
  status: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    cleanExpenses: 0,
    aiConfidence: 94.8
  });
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useExpenseRefresh();

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  const fetchExpenses = async () => {
    try {
      const [expensesRes, anomaliesRes] = await Promise.all([
        fetch(`${API_URL}/expenses`),
        fetch(`${API_URL}/anomalies`)
      ]);

      const expensesData = await expensesRes.json();
      const anomaliesData = await anomaliesRes.json();

      if (expensesData.success) {
        const allExpenses = expensesData.expenses || [];
        const anomalies = anomaliesData.anomalies || [];
        const anomalyExpenseIds = new Set(anomalies.map((a: any) => a.expenseId));

        setExpenses(allExpenses);
        setStats({
          totalExpenses: allExpenses.length,
          cleanExpenses: allExpenses.filter((e: Expense) => !anomalyExpenseIds.has(e.id)).length,
          aiConfidence: 94.8
        });
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const getAIFlag = (status: string) => {
    if (status === "Processed") return "Clean";
    if (status === "Needs Review") return "Review";
    return "Clean";
  };

  return (
    <>
      <div className="grid cols-3">
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{stats.totalExpenses}</div>
          <div className="stat-label">Total submissions</div>
        </div>
        <div className="stat-card accent-yellow">
          <div className="stat-label">Awaiting Review</div>
          <div className="stat-value">{expenses.filter(e => e.status === "Needs Review").length}</div>
          <div className="stat-label">Receipts needing action</div>
        </div>
        <div className="stat-card accent-green">
          <div className="stat-label">Clean Expenses</div>
          <div className="stat-value">{stats.cleanExpenses}</div>
          <div className="stat-label">Non-anomalous submissions</div>
        </div>
      </div>
      <div className="section-card">
        <div className="section-header">
          <h3>Expense History</h3>
          <div className="filter-chip-group">
            <button className="filter-chip active">All</button>
            <button className="filter-chip">Approved</button>
            <button className="filter-chip">Pending</button>
            <button className="filter-chip">Flagged</button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Status</th>
              <th>AI Flag</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.uploadedAt)}</td>
                  <td>{expense.vendor || "N/A"}</td>
                  <td>{formatCurrency(expense.total || 0)}</td>
                  <td>
                    <span className="badge blue">{expense.category || "Other"}</span>
                  </td>
                  <td>
                    <span className={statusBadges[expense.status] || "badge yellow"}>{expense.status}</span>
                  </td>
                  <td>
                    <span className={aiBadges[getAIFlag(expense.status)]}>{getAIFlag(expense.status)}</span>
                  </td>
                  <td>
                    <a className="secondary-link" href="#">
                      View
                    </a>{" "}
                    ·
                    <a className="secondary-link" href="#">
                      Export
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#999" }}>
                  No expenses submitted yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="section-card">
        <div className="section-header">
          <h3>Insights & Recommendations</h3>
        </div>
        <div className="insight-grid">
          <div className="insight-card">
            <strong>Travel Spend Elevated</strong>
            <p>Your travel expenses are 18% higher than peers. Consider booking within corporate portal for preferred rates.</p>
          </div>
          <div className="insight-card">
            <strong>Auto-Approve Policy</strong>
            <p>90% of claims under $100 were auto-approved. You can safely raise the threshold to $125 to speed reimbursements.</p>
          </div>
          <div className="insight-card">
            <strong>Duplicate Protection</strong>
            <p>AI prevented 4 duplicate submissions this quarter, saving $1,240. Keep uploading receipts within 24 hours.</p>
          </div>
        </div>
      </div>
    </>
  );
}

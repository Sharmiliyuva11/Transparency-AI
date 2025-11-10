const expenses = [
  { date: "2025-11-01", vendor: "Coffee Shop", amount: "$45", category: "Food", status: "Approved", aiFlag: "Clean" },
  { date: "2025-10-30", vendor: "Uber", amount: "$28", category: "Travel", status: "Approved", aiFlag: "Clean" },
  { date: "2025-10-28", vendor: "Office Depot", amount: "$120", category: "Office", status: "Pending", aiFlag: "Review" },
  { date: "2025-10-25", vendor: "Hotel XYZ", amount: "$250", category: "Travel", status: "Approved", aiFlag: "Clean" },
  { date: "2025-10-24", vendor: "Restaurant", amount: "$85", category: "Food", status: "Flagged", aiFlag: "Anomaly" },
  { date: "2025-10-21", vendor: "Cloud Services", amount: "$320", category: "IT", status: "Approved", aiFlag: "Clean" }
];

const statusBadges: Record<string, string> = {
  Approved: "badge green",
  Pending: "badge yellow",
  Flagged: "badge red"
};

const aiBadges: Record<string, string> = {
  Clean: "badge green",
  Review: "badge yellow",
  Anomaly: "badge red"
};

export default function Expenses() {
  return (
    <>
      <div className="grid cols-3">
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">$12,480</div>
          <div className="stat-label">YTD spend</div>
        </div>
        <div className="stat-card accent-yellow">
          <div className="stat-label">Awaiting Review</div>
          <div className="stat-value">3</div>
          <div className="stat-label">Receipts needing action</div>
        </div>
        <div className="stat-card accent-green">
          <div className="stat-label">AI Confidence</div>
          <div className="stat-value">94.8%</div>
          <div className="stat-label">Auto approvals under threshold</div>
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
            {expenses.map((expense) => (
              <tr key={expense.vendor + expense.date}>
                <td>{expense.date}</td>
                <td>{expense.vendor}</td>
                <td>{expense.amount}</td>
                <td>
                  <span className="badge blue">{expense.category}</span>
                </td>
                <td>
                  <span className={statusBadges[expense.status]}>{expense.status}</span>
                </td>
                <td>
                  <span className={aiBadges[expense.aiFlag]}>{expense.aiFlag}</span>
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
            ))}
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

import { FaRobot } from "react-icons/fa6";

const chatMessages = [
  {
    id: "welcome",
    author: "assistant",
    timestamp: "08:11 pm",
    content: [
      "Hello! I'm Smart Auditor AI, your intelligent expense assistant.",
      "I can help you with analyzing expense patterns, explaining flagged transactions, and recommending cost-saving actions."
    ]
  },
  {
    id: "followup",
    author: "assistant",
    timestamp: "08:12 pm",
    content: [
      "Ask a question to get started, or pick one of the suggested prompts on the right."
    ]
  }
];

const suggestedQuestions = [
  "Why was the Global Airlines transaction flagged?",
  "What are my top spending categories?",
  "How can I improve my expense integrity score?",
  "Explain the recent anomalies detected?",
  "What cost-saving opportunities are available?"
];

const capabilities = [
  { label: "Trend Analysis", description: "Identify spending patterns" },
  { label: "Anomaly Detection", description: "Explain flagged transactions" },
  { label: "Report Generation", description: "Custom insights on demand" },
  { label: "Smart Recommendations", description: "Cost saving opportunities" }
];

const stats = [
  { label: "Response Time", value: "< 2 sec" },
  { label: "Accuracy Rate", value: "94.8%" },
  { label: "Questions Answered", value: "1,247" }
];

export default function Assistant() {
  return (
    <div className="assistant-layout">
      <div className="section-card assistant-chat">
        <div className="chat-header">
          <div className="chat-profile">
            <div className="chat-avatar">
              <FaRobot />
            </div>
            <div>
              <h3>Smart Auditor AI</h3>
              <span>Always online and ready to help</span>
            </div>
          </div>
          <span className="badge green">Online</span>
        </div>
        <div className="chat-messages">
          {chatMessages.map((message) => (
            <div key={message.id} className="chat-bubble">
              <div className="chat-meta">
                <FaRobot />
                <span>Smart Auditor AI</span>
                <time>{message.timestamp}</time>
              </div>
              {message.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <input className="chat-input" placeholder="Ask me anything about your expenses..." />
          <button className="primary-button" style={{ width: 120 }}>Send</button>
        </div>
      </div>
      <div className="assistant-sidebar">
        <div className="section-card suggestion-card">
          <h3>Suggested Questions</h3>
          <div className="suggestion-list">
            {suggestedQuestions.map((question) => (
              <button key={question} className="suggestion-item">
                {question}
              </button>
            ))}
          </div>
        </div>
        <div className="section-card capability-card">
          <h3>AI Capabilities</h3>
          <ul className="capability-list">
            {capabilities.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="section-card stats-card">
          <h3>Quick Stats</h3>
          <div className="quick-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="quick-stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

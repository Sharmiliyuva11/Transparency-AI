import React, { useState, useEffect } from "react";
import { FiCamera, FiCloudLightning } from "react-icons/fi";

const pipelineSteps = [
  { title: "OCR Extraction", description: "AI captures receipt text instantly" },
  { title: "Data Cleaning", description: "Normalizes amounts and vendors" },
  { title: "NLP Classification", description: "Categorizes spend automatically" },
  { title: "Fraud Detection", description: "Flags anomalies for review" },
];

const statusBadges: Record<string, string> = {
  Processed: "badge green",
  Processing: "badge yellow",
  Flagged: "badge red",
  "Needs Review": "badge orange"
};

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("Awaiting upload");
  const [uploadStatus, setUploadStatus] = useState<string>("Awaiting upload");
  const [loading, setLoading] = useState<boolean>(false);
  const [classification, setClassification] = useState<any>(null);
  const [entities, setEntities] = useState<any>(null);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);

  const API_URL = "http://127.0.0.1:5000";

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setOcrText("Awaiting upload");
      setUploadStatus("Ready to upload");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setOcrText("Awaiting upload");
      setUploadStatus("Ready to upload");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const fetchRecentUploads = async () => {
    try {
      const res = await fetch(`${API_URL}/recent-uploads`);
      const data = await res.json();
      if (data.success && data.uploads) {
        setRecentUploads(data.uploads);
      }
    } catch (err) {
      console.error("Error fetching uploads:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file first!");
    setLoading(true);
    setUploadStatus("Processing...");
    setClassification(null);
    setEntities(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Server returned an error");

      const data = await res.json();
      if (data.success) {
        setOcrText(data.text || "No text extracted");
        setClassification(data.classification);
        setEntities(data.entities);
        setUploadStatus("Processed");
        await fetchRecentUploads();
      } else {
        setOcrText(data.error || "Upload failed");
        setUploadStatus("Error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setOcrText("❌ Error connecting to server.");
      setUploadStatus("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== Upload Section ===== */}
      <div className="grid cols-2">
        <div className="section-card" style={{ minHeight: 320 }}>
          <div className="section-header">
            <h3>Document Upload</h3>
            <span className="badge blue">Max 10 MB</span>
          </div>
          <div
            className="upload-dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <FiCamera size={36} color="#3ba8ff" />
            <div>Drag & drop your receipt here</div>
            <div className="dashboard-subtitle">or click to browse</div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            <button
              className="primary-button"
              style={{ width: 200, marginTop: 10 }}
              disabled={!file || loading}
              onClick={handleUpload}
            >
              {loading ? "Processing..." : "Upload & Extract"}
            </button>
          </div>
        </div>

        <div className="section-card" style={{ minHeight: 320 }}>
          <div className="section-header">
            <h3>OCR Extraction Preview</h3>
            <span
              className={`badge ${
                uploadStatus === "Processed"
                  ? "green"
                  : uploadStatus === "Processing..."
                  ? "yellow"
                  : uploadStatus === "Error"
                  ? "red"
                  : "gray"
              }`}
            >
              {uploadStatus}
            </span>
          </div>
          <div
            className="upload-preview"
            style={{ height: 220, overflowY: "auto", paddingBottom: 16 }}
          >
            {ocrText === "Awaiting upload" ? (
              "Upload a document to see extracted data"
            ) : (
              <div>
                {classification && (
                  <div style={{ marginBottom: 16 }}>
                    <strong style={{ color: "#3ba8ff" }}>📁 Category:</strong>
                    <div style={{ fontSize: 14, marginTop: 4 }}>
                      {classification.label}
                      <span style={{ marginLeft: 8, color: "#666" }}>
                        ({(classification.score * 100).toFixed(1)}% confidence)
                      </span>
                    </div>
                  </div>
                )}
                {entities?.vendor && (
                  <div style={{ marginBottom: 16 }}>
                    <strong style={{ color: "#38d788" }}>🏪 Vendor:</strong>
                    <div style={{ fontSize: 14, marginTop: 4 }}>{entities.vendor}</div>
                  </div>
                )}
                {entities?.total > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <strong style={{ color: "#ffa94d" }}>💰 Amount:</strong>
                    <div style={{ fontSize: 14, marginTop: 4 }}>${entities.total.toFixed(2)}</div>
                  </div>
                )}
                <div>
                  <strong>📄 Extracted Text:</strong>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
                    {ocrText?.substring(0, 200)}...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== AI Processing Pipeline ===== */}
      <div className="section-card">
        <div className="section-header">
          <h3>AI Processing Pipeline</h3>
        </div>
        <div className="pipeline-grid">
          {pipelineSteps.map((step) => (
            <div key={step.title} className="pipeline-step">
              <FiCloudLightning color="#3ba8ff" />
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Recent Uploads Table ===== */}
      <div className="section-card">
        <div className="section-header">
          <h3>Recent Uploads</h3>
          <a 
            className="secondary-link" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              fetchRecentUploads();
            }}
          >
            Refresh
          </a>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Upload Date</th>
              <th>Category</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentUploads.length > 0 ? (
              recentUploads.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.file}</td>
                  <td>{new Date(item.uploadedAt).toLocaleDateString()}</td>
                  <td>
                    <span className="badge blue">{item.category}</span>
                  </td>
                  <td>
                    <span className={statusBadges[item.status]}>
                      {item.status}
                    </span>
                  </td>
                  <td>${item.total?.toFixed(2) || "0.00"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#999" }}>
                  No uploads yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

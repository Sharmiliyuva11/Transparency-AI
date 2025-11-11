import React, { useState } from "react";
import { FiCamera, FiCloudLightning } from "react-icons/fi";

const pipelineSteps = [
  { title: "OCR Extraction", description: "AI captures receipt text instantly" },
  { title: "Data Cleaning", description: "Normalizes amounts and vendors" },
  { title: "NLP Classification", description: "Categorizes spend automatically" },
  { title: "Fraud Detection", description: "Flags anomalies for review" },
];

const recentUploads = [
  { file: "Receipt_Nov01.pdf", date: "2025-11-01", status: "Processed" },
  { file: "Taxi_Trip_1028.png", date: "2025-10-28", status: "Processing" },
  { file: "Dinner_Team_1025.jpg", date: "2025-10-25", status: "Flagged" },
];

const statusBadges: Record<string, string> = {
  Processed: "badge green",
  Processing: "badge yellow",
  Flagged: "badge red",
};

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("Awaiting upload");
  const [uploadStatus, setUploadStatus] = useState<string>("Awaiting upload");
  const [loading, setLoading] = useState<boolean>(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setOcrText("Awaiting upload");
      setUploadStatus("Ready to upload");
    }
  };

  // Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setOcrText("Awaiting upload");
      setUploadStatus("Ready to upload");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // Upload file to backend
  const handleUpload = async () => {
    if (!file) return alert("Please choose a file first!");
    setLoading(true);
    setUploadStatus("Processing...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.text) {
        setOcrText(data.text);
        setUploadStatus("Processed");
      } else {
        setOcrText(data.error || "No text extracted.");
        setUploadStatus("Error");
      }
    } catch (err) {
      console.error(err);
      setOcrText("Error connecting to server.");
      setUploadStatus("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== Upload Section ===== */}
      <div className="grid cols-2">
        {/* Document Upload */}
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
              {loading ? "Processing..." : "Choose File"}
            </button>
          </div>
        </div>

        {/* OCR Preview */}
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
          <div className="upload-preview" style={{ height: 220, overflowY: "auto" }}>
            {ocrText === "Awaiting upload"
              ? "Upload a document to see extracted data"
              : ocrText}
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
          <a className="secondary-link" href="#">
            View History
          </a>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th>Insights</th>
            </tr>
          </thead>
          <tbody>
            {recentUploads.map((item) => (
              <tr key={item.file}>
                <td>{item.file}</td>
                <td>{item.date}</td>
                <td>
                  <span className={statusBadges[item.status]}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="badge blue">Ready</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

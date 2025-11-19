import { useState, useRef, useEffect } from "react";
import { FiCamera, FiCloudLightning, FiX, FiCheck } from "react-icons/fi";
import { useExpenseRefresh } from "../../context/ExpenseContext";

const pipelineSteps = [
  { title: "OCR Extraction", description: "AI captures receipt text instantly" },
  { title: "Data Cleaning", description: "Normalizes amounts and vendors" },
  { title: "NLP Classification", description: "Categorizes spend automatically" },
  { title: "Fraud Detection", description: "Flags anomalies for review" }
];

const statusBadges: Record<string, string> = {
  Processed: "badge green",
  Processing: "badge yellow",
  Flagged: "badge red",
  "Needs Review": "badge orange"
};

interface Upload {
  file: string;
  uploadedAt: string;
  status: string;
  category: string;
  confidence: number;
  textPreview: string;
  vendor?: string;
  total?: number;
}

export default function Upload() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { triggerRefresh } = useExpenseRefresh();

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const fetchRecentUploads = async () => {
    try {
      const response = await fetch(`${API_URL}/recent-uploads`);
      const data = await response.json();
      if (data.success) {
        setUploads(data.uploads || []);
      }
    } catch (err) {
      console.error("Error fetching uploads:", err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/ocr`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setExtractedData({
          text: data.text,
          classification: data.classification,
          entities: data.entities,
          fileName: file.name
        });
        await fetchRecentUploads();
        triggerRefresh();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Network error. Make sure backend is running on http://localhost:5000");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <>
      <div className="grid cols-2">
        <div className="section-card" style={{ minHeight: 320 }}>
          <div className="section-header">
            <h3>Document Upload</h3>
            <span className="badge blue">Max 10 MB</span>
          </div>
          <div 
            className={`upload-dropzone ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{ cursor: "pointer" }}
          >
            <FiCamera size={36} color="#3ba8ff" />
            <div>Drag & drop your receipt here</div>
            <div className="dashboard-subtitle">or click to browse</div>
            <button 
              className="primary-button" 
              style={{ width: 200 }}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={handleFileInput}
            />
          </div>
          {loading && <div style={{ marginTop: 16, textAlign: "center" }}>Processing...</div>}
          {error && <div style={{ marginTop: 16, color: "red", textAlign: "center" }}>{error}</div>}
        </div>

        <div className="section-card" style={{ minHeight: 320 }}>
          <div className="section-header">
            <h3>OCR Extraction Preview</h3>
            <span className={`badge ${extractedData ? "green" : "yellow"}`}>
              {extractedData ? "Processed" : "Awaiting upload"}
            </span>
          </div>
          <div className="upload-preview" style={{ height: 220, overflowY: "auto" }}>
            {extractedData ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <strong>File:</strong> {extractedData.fileName}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Category:</strong> {extractedData.classification?.label}
                  <span style={{ marginLeft: 8, color: "#666" }}>
                    ({(extractedData.classification?.score * 100).toFixed(1)}%)
                  </span>
                </div>
                {extractedData.entities?.vendor && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Vendor:</strong> {extractedData.entities.vendor}
                  </div>
                )}
                {extractedData.entities?.total > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Amount:</strong> ${extractedData.entities.total.toFixed(2)}
                  </div>
                )}
                <div>
                  <strong>Extracted Text:</strong>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                    {extractedData.text?.substring(0, 150)}...
                  </div>
                </div>
              </div>
            ) : (
              "Upload a document to see extracted data"
            )}
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>AI Processing Pipeline</h3>
        </div>
        <div className="pipeline-grid">
          {pipelineSteps.map((step) => (
            <div key={step.title} className="pipeline-step">
              <FiCloudLightning />
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>
          ))}
        </div>
      </div>

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
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {uploads.length > 0 ? (
              uploads.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.file}</td>
                  <td>{formatDate(item.uploadedAt)}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={statusBadges[item.status] || "badge gray"}>
                      {item.status}
                    </span>
                  </td>
                  <td>{(item.confidence * 100).toFixed(1)}%</td>
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

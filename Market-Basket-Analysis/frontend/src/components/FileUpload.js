import axios from "axios";
import { useState } from "react";

const FileUpload = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [minSupport, setMinSupport] = useState(0.1);
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("min_support", minSupport);
    formData.append("min_confidence", minConfidence);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      onAnalysisComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during analysis");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h4>Upload Sales Data</h4>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="fileInput" className="form-label">CSV File</label>
            <input
              type="file"
              className="form-control"
              id="fileInput"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
            <div className="form-text">
              Upload a CSV file with one transaction per line, items separated by commas.
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="minSupport" className="form-label">Minimum Support ({minSupport})</label>
              <input
                type="range"
                className="form-range"
                id="minSupport"
                min="0.01"
                max="0.5"
                step="0.01"
                value={minSupport}
                onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="minConfidence" className="form-label">Minimum Confidence ({minConfidence})</label>
              <input
                type="range"
                className="form-range"
                id="minConfidence"
                min="0.1"
                max="1.0"
                step="0.05"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;

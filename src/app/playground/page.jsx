"use client";
import { useState } from "react";

export default function Playground() {
  const [file, setFile] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setEmails(data.emails);
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload CSV/Excel to Extract Emails</h2>

      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload & Extract"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {emails.length > 0 && (
        <div>
          <h3>Extracted Emails:</h3>
          <ul>
            {emails.map((email, i) => (
              <li key={i}>{email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

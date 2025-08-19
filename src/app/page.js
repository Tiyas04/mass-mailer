'use client'

import { useState } from 'react';

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Upload & Extract Emails
  const handleUpload = async () => {
    if (!file) {
      setStatus('❌ Please select a file first');
      return;
    }
    setLoading(true);
    setStatus('Uploading & extracting...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        // merge extracted emails with manual input if any
        const existing = emails ? emails.split(',').map(e => e.trim()) : [];
        const merged = [...new Set([...existing, ...data.emails])];
        setEmails(merged.join(', '));
        setStatus(`✅ Extracted ${data.emails.length} emails`);
      } else {
        setStatus(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error uploading file');
    }

    setLoading(false);
  };

  // Send Emails
  const handleSend = async (e) => {
    e.preventDefault();

    if (!emails) {
      setStatus('❌ No recipient emails provided');
      return;
    }

    setLoading(true);
    setStatus('Sending emails...');

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, subject, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(`✅ ${data.message}`);
        setSubject('');
        setMessage('');
        // keep emails in case user wants to resend
      } else {
        setStatus(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error sending emails');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">📧 Mass Mailer</h1>
          <p className="text-gray-600">
            Upload a CSV/Excel file or enter emails manually, then send your campaign
          </p>
        </div>

        {/* Upload + Recipients */}
        <div className="p-6 border rounded bg-white shadow space-y-4">
          <h2 className="font-semibold">Step 1: Add Recipients</h2>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? 'Processing...' : 'Upload & Extract Emails'}
          </button>

          <textarea
            placeholder="Recipient emails (comma-separated)"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={3}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Subject + Message */}
        <form onSubmit={handleSend} className="p-6 border rounded bg-white shadow space-y-4">
          <h2 className="font-semibold">Step 2: Compose Email</h2>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <textarea
            placeholder="Message body..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading ? 'Sending...' : 'Send Emails'}
          </button>
        </form>

        {/* Status */}
        {status && (
          <div className="text-center p-3 border rounded bg-gray-100">
            {status}
          </div>
        )}
      </div>
    </main>
  );
}

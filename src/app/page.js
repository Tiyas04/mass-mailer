'use client'

import { useEffect, useMemo, useState } from 'react';

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // theme toggle
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null;
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (stored === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const parseEmails = (value) => {
    if (!value) return [];
    const parts = value
      .split(/[\s,;\n\r]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    return Array.from(new Set(parts));
  };

  const emailList = useMemo(() => parseEmails(emails), [emails]);
  const emailCount = emailList.length;

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
        const existing = emails ? parseEmails(emails) : [];
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
      } else {
        setStatus(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Error sending emails');
    }

    setLoading(false);
  };

  const isSuccess = status.startsWith('✅');
  const isError = status.startsWith('❌');
  const statusClasses = isSuccess
    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-300'
    : isError
    ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300'
    : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200';

  return (
    <main className="min-h-screen px-4 py-6 md:py-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Topbar */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-fuchsia-600"></div>
            <div className="font-semibold">Mass Mailer</div>
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Ready
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700/60 dark:bg-slate-900/60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.64 13a9 9 0 01-11.31-11.31A9 9 0 1021.64 13z" />
              </svg>
              Theme
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium border-slate-200/70 bg-white/70 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
            <span>Bulk Campaign</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-fuchsia-400 dark:to-rose-400">
              Reach inboxes at scale
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Upload a CSV/Excel file or enter emails manually, then compose and send your campaign with confidence.
          </p>

          {/* Stepper */}
          <div className="mx-auto mt-4 flex max-w-md items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white text-xs grid place-content-center">1</div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Recipients</span>
            </div>
            <div className="h-px flex-1 mx-2 bg-gradient-to-r from-indigo-500/50 to-fuchsia-500/50"></div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-fuchsia-600 text-white text-xs grid place-content-center">2</div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Compose</span>
            </div>
            <div className="h-px flex-1 mx-2 bg-gradient-to-r from-fuchsia-500/50 to-emerald-500/50"></div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs grid place-content-center">3</div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Send</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Upload + Recipients */}
          <div className="md:col-span-3 p-6 md:p-8 rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Step 1: Add Recipients</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{emailCount} recipients</span>
            </h2>

            <div className="mt-4 grid gap-4">
              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative grid place-content-center rounded-xl border-2 border-dashed px-4 py-8 text-center text-sm transition-colors ${dragging ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20' : 'border-slate-300/60 bg-white/50 dark:border-slate-700/60 dark:bg-slate-900/40'}`}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center gap-2">
                  <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7 20h10a2 2 0 002-2v-5h-2v5H7v-5H5v5a2 2 0 002 2zm5-16l5 5h-3v4h-4v-4H7l5-5z"/></svg>
                  <div>Drag and drop your CSV/Excel here, or click to browse</div>
                  {file && (
                    <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button type="button" onClick={() => setFile(null)} className="text-rose-600 hover:underline">Clear</button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || !file}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-sm hover:from-indigo-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-slate-950"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Upload & Extract Emails'
                )}
              </button>

              <textarea
                placeholder="Recipient emails (comma-separated)"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-300/60 bg-white/70 px-3 py-2 text-sm placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700/60 dark:bg-slate-900/60"
              />

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="rounded-xl border border-slate-200/60 bg-white/60 p-3 dark:border-slate-700/60 dark:bg-slate-900/50">
                  <div className="font-medium">Unique recipients</div>
                  <div className="text-lg font-semibold">{emailCount}</div>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white/60 p-3 dark:border-slate-700/60 dark:bg-slate-900/50">
                  <div className="font-medium">Selected file</div>
                  <div className="truncate text-sm">{file ? file.name : 'None'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compose + Preview */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSend} className="p-6 md:p-8 rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Step 2: Compose Email</h2>
              <div className="mt-4 grid gap-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300/60 bg-white/70 px-3 py-2 text-sm placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700/60 dark:bg-slate-900/60"
                  required
                />
                <textarea
                  placeholder="Message body..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-slate-300/60 bg-white/70 px-3 py-2 text-sm placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700/60 dark:bg-slate-900/60"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || emailCount === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-slate-950"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <>
                      <span>Send Emails</span>
                      {emailCount > 0 && (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{emailCount}</span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Preview */}
            <div className="p-6 md:p-8 rounded-2xl border border-slate-200/60 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/60">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Preview</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="text-slate-500 dark:text-slate-400">To: <span className="font-medium text-slate-700 dark:text-slate-200">{emailCount} recipients</span></div>
                <div className="text-slate-500 dark:text-slate-400">Subject: <span className="font-medium text-slate-700 dark:text-slate-200">{subject || '—'}</span></div>
                <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200" style={{ whiteSpace: 'pre-wrap' }}>
                  {message || 'Your message will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div aria-live="polite" className={`text-center p-4 rounded-xl border animate-in fade-in zoom-in duration-200 ${statusClasses}`}>
            {status}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Built with ❤ for reliable delivery
        </div>
      </div>
    </main>
  );
}

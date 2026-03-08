'use client';

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Student } from '@/lib/types';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState('');

  const loadPending = async (authToken: string) => {
    const res = await fetch('/api/profiles?status=pending', {
      headers: { 'x-admin-token': authToken }
    });

    const json = (await res.json()) as { ok: boolean; data?: Student[]; message?: string };
    if (!json.ok) {
      setMessage(json.message ?? 'Unauthorized');
      return;
    }

    setStudents(json.data ?? []);
    setMessage('Loaded pending profiles.');
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ id, status })
    });

    const json = (await res.json()) as { ok: boolean; message: string };
    setMessage(json.message);
    if (json.ok) {
      await loadPending(token);
    }
  };

  useEffect(() => {
    if (token) {
      void loadPending(token);
    }
  }, [token]);

  return (
    <main>
      <Header />
      <section className="container hero">
        <h1>Admin Approval Panel</h1>
        <p>Approve or reject pending profile submissions.</p>
      </section>

      <section className="container panel">
        <div className="form" style={{ marginBottom: '1rem' }}>
          <input
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="muted">Set this in ADMIN_TOKEN environment variable.</p>
        </div>
        {message && <p className="muted">{message}</p>}

        <div className="grid">
          {students.map((student) => (
            <article className="card" key={student.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={student.profile_photo_url} alt={student.full_name} />
              <div className="card-content">
                <strong>{student.full_name}</strong>
                <span className="muted">{student.home_district}</span>
                <span className="muted">Roll: {student.admission_roll}</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => updateStatus(student.id, 'approved')}>
                    Approve
                  </button>
                  <button type="button" onClick={() => updateStatus(student.id, 'rejected')}>
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

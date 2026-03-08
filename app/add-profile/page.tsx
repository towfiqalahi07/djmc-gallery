'use client';

import { useState } from 'react';
import { Header } from '../components/Header';

type ApiResult = { ok: boolean; message: string };

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = reject;
  });

export default function AddProfilePage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [pending, setPending] = useState(false);

  const sendOtp = async () => {
    setPending(true);
    setStatus('');
    const res = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    const json = (await res.json()) as ApiResult;
    setStatus(json.message);
    setPending(false);
  };

  const verifyOtp = async () => {
    setPending(true);
    setStatus('');
    const res = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });

    const json = (await res.json()) as ApiResult;
    if (json.ok) {
      setVerified(true);
    }
    setStatus(json.message);
    setPending(false);
  };

  const submitProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setStatus('');

    const form = event.currentTarget;
    const fileInput = form.profilePhoto as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setStatus('Please upload a profile photo.');
      setPending(false);
      return;
    }

    if (file.size > 1024 * 1024) {
      setStatus('Profile photo must be 1MB or less.');
      setPending(false);
      return;
    }

    const imageBase64 = await toBase64(file);

    const payload = {
      phone,
      fullName: (form.fullName as HTMLInputElement).value,
      homeDistrict: (form.homeDistrict as HTMLInputElement).value,
      hscBatch: (form.hscBatch as HTMLInputElement).value,
      admissionRoll: (form.admissionRoll as HTMLInputElement).value,
      imageBase64,
      fileName: file.name
    };

    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = (await res.json()) as ApiResult;
    setStatus(json.message);
    if (json.ok) {
      form.reset();
    }
    setPending(false);
  };

  return (
    <main>
      <Header />
      <section className="container hero">
        <h1>Add Your Profile</h1>
        <p>Verify phone number first, then submit your student profile.</p>
      </section>

      <section className="container panel" style={{ marginBottom: '1rem' }}>
        <h3>Step 1: OTP Verification</h3>
        <div className="form">
          <input
            placeholder="Phone (8801XXXXXXXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" disabled={pending} onClick={sendOtp}>
              Send OTP
            </button>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: '180px' }}
            />
            <button type="button" disabled={pending} onClick={verifyOtp}>
              Verify OTP
            </button>
          </div>
          <p className={verified ? 'success' : 'muted'}>
            {verified ? 'Phone verified. You can submit profile now.' : 'Phone not verified yet.'}
          </p>
        </div>
      </section>

      <section className="container panel" style={{ marginBottom: '2rem' }}>
        <h3>Step 2: Profile Details</h3>
        <form className="form" onSubmit={submitProfile}>
          <input name="fullName" placeholder="Full Name" required />
          <input name="homeDistrict" placeholder="Home District" required />
          <input name="hscBatch" placeholder="HSC Batch" required />
          <input name="admissionRoll" placeholder="MBBS Admission Test Roll" required />
          <input name="profilePhoto" type="file" accept="image/png,image/jpeg,image/webp" required />
          <button type="submit" disabled={pending || !verified}>
            Submit for Approval
          </button>
          <p className="muted">One phone number can upload one profile maximum. Max image size: 1MB.</p>
          {status && <p className={status.toLowerCase().includes('success') ? 'success' : 'error'}>{status}</p>}
        </form>
      </section>
    </main>
  );
}

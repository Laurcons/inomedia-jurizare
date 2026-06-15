'use client';

import { apiFetch } from '@/lib/apiFetch';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ImpersonationReturnButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReturn() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/return', { method: 'POST' });
      if (res.ok) router.push('/admin');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn btn-sm btn-warning ms-2" onClick={handleReturn} disabled={loading}>
      {loading ? <span className="spinner-border spinner-border-sm" /> : 'Înapoi la admin'}
    </button>
  );
}

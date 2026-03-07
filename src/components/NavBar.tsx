'use client';

import { useRouter } from 'next/navigation';

interface NavBarProps {
  role: 'teacher' | 'admin';
}

export default function NavBar({ role }: NavBarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container">
        <span className="navbar-brand fw-semibold">
          {role === 'admin' ? 'Panou Admin' : 'Platforma de Jurizare'}
        </span>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
          Deconectare
        </button>
      </div>
    </nav>
  );
}

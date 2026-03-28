import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center px-3">
        <h1 className="display-6 fw-bold mb-2">Concursul „Inomedia. Interferențe Spirituale”</h1>
        <p className="text-muted mb-5">Competiție națională de videoclipuri istorice</p>
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <Link href="/auth/login" className="btn btn-primary btn-lg px-5">
            Autentificare (profesor / admin)
          </Link>
          <Link href="/student" className="btn btn-outline-secondary btn-lg px-5">
            Sunt elev
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center px-3">
        <h1 className="display-1 fw-bold text-muted">404</h1>
        <p className="h5 mb-4">Pagina nu a fost găsită.</p>
        <Link href="/" className="btn btn-primary">
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}

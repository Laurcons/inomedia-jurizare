import NavBar from '@/components/NavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar role="admin" />
      <main className="container py-4">{children}</main>
    </>
  );
}

import NavBar from '@/components/NavBar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar role="teacher" />
      <main className="container py-4">{children}</main>
    </>
  );
}

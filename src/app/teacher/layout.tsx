import NavBar from '@/components/NavBar';
import { getSession } from '@/lib/session';
import ImpersonationReturnButton from './ImpersonationReturnButton';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      <NavBar role="teacher" />
      {session.originalAdminId && (
        <div className="alert alert-warning mb-0 rounded-0 text-center small py-2">
          Ești în modul impersonificare.
          <ImpersonationReturnButton />
        </div>
      )}
      <main className="container py-4">{children}</main>
    </>
  );
}

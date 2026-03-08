import { Header } from './components/Header';
import { StudentCard } from './components/StudentCard';
import { createServiceClient } from '@/lib/supabase';
import { Student } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let students: Student[] = [];

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', 'approved')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Failed to load students for homepage:', error.message);
    } else {
      students = (data ?? []) as Student[];
    }
  } catch (error) {
    console.error('Homepage data fetch failed:', error);
  }

  return (
    <main>
      <Header />
      <section className="hero container">
        <h1>DJMC 35 Student Gallery</h1>
        <p>A minimal dark directory of approved running students.</p>
      </section>
      <section className="container grid">
        {students.length === 0 ? (
          <p className="muted">No approved profiles yet.</p>
        ) : (
          students.map((student) => <StudentCard key={student.id} student={student} />)
        )}
      </section>
    </main>
  );
}

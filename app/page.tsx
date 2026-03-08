import { Header } from './components/Header';
import { StudentCard } from './components/StudentCard';
import { createServiceClient } from '@/lib/supabase';
import { Student } from '@/lib/types';

export default async function HomePage() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('status', 'approved')
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const students = (data ?? []) as Student[];

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

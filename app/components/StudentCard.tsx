import Image from 'next/image';
import { Student } from '@/lib/types';

export const StudentCard = ({ student }: { student: Student }) => (
  <article className="card">
    <Image
      src={student.profile_photo_url}
      alt={student.full_name}
      width={500}
      height={500}
      unoptimized
    />
    <div className="card-content">
      <div>
        <div className="label">Full Name</div>
        <div className="value">{student.full_name}</div>
      </div>
      <div>
        <div className="label">Home District</div>
        <div className="value">{student.home_district}</div>
      </div>
      <div>
        <div className="label">HSC Batch</div>
        <div className="value">{student.hsc_batch}</div>
      </div>
      <div>
        <div className="label">MBBS Admission Roll</div>
        <div className="value">{student.admission_roll}</div>
      </div>
    </div>
  </article>
);

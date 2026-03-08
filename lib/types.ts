export type StudentStatus = 'pending' | 'approved' | 'rejected';

export interface Student {
  id: string;
  full_name: string;
  home_district: string;
  hsc_batch: string;
  admission_roll: string;
  profile_photo_url: string;
  phone: string;
  status: StudentStatus;
  created_at: string;
}

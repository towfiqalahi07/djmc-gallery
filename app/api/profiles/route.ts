import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { profileSchema } from '@/lib/validation';

const adminToken = process.env.ADMIN_TOKEN;
const bucketName = process.env.SUPABASE_BUCKET ?? 'student-photos';

const isAuthorizedAdmin = (request: NextRequest) => {
  const token = request.headers.get('x-admin-token');
  return Boolean(adminToken && token && token === adminToken);
};

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get('status') ?? 'pending';
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = profileSchema.parse(body);

    const supabase = createServiceClient();

    const { data: otpSession } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('phone', payload.phone)
      .maybeSingle();

    if (!otpSession?.verified) {
      return NextResponse.json({ ok: false, message: 'Phone is not verified.' }, { status: 403 });
    }

    const imageBuffer = Buffer.from(payload.imageBase64, 'base64');
    if (imageBuffer.byteLength > 1024 * 1024) {
      return NextResponse.json({ ok: false, message: 'Profile photo must be <= 1MB.' }, { status: 400 });
    }

    const ext = payload.fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
    const allowedExt = ['jpg', 'jpeg', 'png', 'webp'];

    if (!allowedExt.includes(ext)) {
      return NextResponse.json({ ok: false, message: 'Invalid image type.' }, { status: 400 });
    }

    const path = `${payload.phone}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(path, imageBuffer, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, upsert: false });

    if (uploadError) {
      return NextResponse.json({ ok: false, message: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from(bucketName).getPublicUrl(path);

    const { error: insertError } = await supabase.from('students').insert({
      full_name: payload.fullName,
      home_district: payload.homeDistrict,
      hsc_batch: payload.hscBatch,
      admission_roll: payload.admissionRoll,
      profile_photo_url: publicUrl,
      phone: payload.phone,
      status: 'pending'
    });

    if (insertError) {
      return NextResponse.json({ ok: false, message: insertError.message }, { status: 409 });
    }

    await supabase.from('otp_sessions').delete().eq('phone', payload.phone);

    return NextResponse.json({ ok: true, message: 'Submission success. Waiting for admin approval.' });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; status?: 'approved' | 'rejected' };
  if (!body.id || !body.status) {
    return NextResponse.json({ ok: false, message: 'id and status are required.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('students').update({ status: body.status }).eq('id', body.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: `Profile ${body.status}.` });
}

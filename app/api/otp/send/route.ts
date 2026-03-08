import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateOtp, sendOtpSms } from '@/lib/otp';
import { phoneSchema } from '@/lib/validation';

const OTP_TTL_MINUTES = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = phoneSchema.parse(body.phone);
    const supabase = createServiceClient();

    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingStudent) {
      return NextResponse.json({ ok: false, message: 'This phone already has a profile.' }, { status: 409 });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    // Save OTP session first so verify endpoint can always find it after successful send response.
    const { error: upsertError } = await supabase.from('otp_sessions').upsert(
      {
        phone,
        otp_code: otp,
        expires_at: expiresAt,
        attempt_count: 0,
        verified: false
      },
      { onConflict: 'phone' }
    );

    if (upsertError) {
      return NextResponse.json(
        { ok: false, message: `Failed to create OTP session: ${upsertError.message}` },
        { status: 500 }
      );
    }

    try {
      await sendOtpSms(phone, otp);
    } catch (smsError) {
      // Cleanup session when SMS send fails to avoid stale/unknown OTP state.
      await supabase.from('otp_sessions').delete().eq('phone', phone);

      return NextResponse.json(
        { ok: false, message: smsError instanceof Error ? smsError.message : 'Failed to send OTP SMS.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, message: 'OTP sent successfully.' });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { otpSchema, phoneSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = phoneSchema.parse(body.phone);
    const otp = otpSchema.parse(body.otp);

    const supabase = createServiceClient();

    const { data: session, error: sessionError } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({ ok: false, message: 'OTP session not found.' }, { status: 404 });
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ ok: false, message: 'OTP expired. Request a new OTP.' }, { status: 400 });
    }

    if (session.otp_code !== otp) {
      await supabase
        .from('otp_sessions')
        .update({ attempt_count: session.attempt_count + 1 })
        .eq('phone', phone);

      return NextResponse.json({ ok: false, message: 'Invalid OTP.' }, { status: 400 });
    }

    await supabase.from('otp_sessions').update({ verified: true }).eq('phone', phone);

    return NextResponse.json({ ok: true, message: 'Phone verified successfully.' });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

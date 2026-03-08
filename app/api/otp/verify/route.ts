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

    if (sessionError) {
      return NextResponse.json(
        { ok: false, message: `Could not verify OTP session: ${sessionError.message}` },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          message: 'OTP session not found. Please request OTP again and verify within 5 minutes.'
        },
        { status: 404 }
      );
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

    const { error: verifyError } = await supabase.from('otp_sessions').update({ verified: true }).eq('phone', phone);

    if (verifyError) {
      return NextResponse.json(
        { ok: false, message: `Failed to mark phone as verified: ${verifyError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: 'Phone verified successfully.' });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

const otpApiBase = process.env.OTP_API_BASE_URL;
const otpApiKey = process.env.OTP_API_KEY;
const otpSenderId = process.env.OTP_SENDER_ID;
const brandName = process.env.OTP_BRAND_NAME ?? 'DJMC35';

export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const otpMessageTemplate = (code: string) =>
  `${brandName} OTP is ${code}. Don't share it with anyone.`;

export const sendOtpSms = async (phone: string, code: string) => {
  if (!otpApiBase || !otpApiKey || !otpSenderId) {
    throw new Error('OTP credentials are missing in env');
  }

  const params = new URLSearchParams({
    api_key: otpApiKey,
    type: 'text',
    number: phone,
    senderid: otpSenderId,
    message: otpMessageTemplate(code)
  });

  const response = await fetch(`${otpApiBase}?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OTP API failed: ${response.status} ${text}`);
  }

  return response.text();
};

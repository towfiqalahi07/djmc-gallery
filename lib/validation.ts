import { z } from 'zod';

const BANGLADESH_CANONICAL_PHONE_REGEX = /^8801[3-9]\d{8}$/;

export const normalizeBangladeshPhone = (rawPhone: string) => {
  const cleaned = rawPhone.trim().replace(/[\s-]/g, '');

  if (/^01[3-9]\d{8}$/.test(cleaned)) {
    return `88${cleaned}`;
  }

  if (/^\+8801[3-9]\d{8}$/.test(cleaned)) {
    return cleaned.slice(1);
  }

  return cleaned;
};

export const phoneSchema = z
  .string()
  .transform(normalizeBangladeshPhone)
  .refine((value) => BANGLADESH_CANONICAL_PHONE_REGEX.test(value), {
    message: 'Phone must be 01XXXXXXXXX or 8801XXXXXXXXX format'
  });

export const otpSchema = z.string().trim().regex(/^\d{4,6}$/, 'OTP must be 4-6 digits');

export const profileSchema = z.object({
  phone: phoneSchema,
  fullName: z.string().trim().min(3).max(120),
  homeDistrict: z.string().trim().min(2).max(80),
  hscBatch: z.string().trim().min(4).max(30),
  admissionRoll: z.string().trim().min(3).max(40),
  imageBase64: z.string().min(1),
  fileName: z.string().trim().min(3).max(100)
});

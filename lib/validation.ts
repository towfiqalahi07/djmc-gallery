import { z } from 'zod';

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^8801[3-9]\d{8}$/, 'Phone must be in 8801XXXXXXXXX format');

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

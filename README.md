# DJMC 35 Student Gallery (Vercel + Supabase)

A dark minimal webapp for DJMC Batch 35 where students submit profiles via phone OTP verification, then admins approve profiles before public display.

## Features

- Public homepage with **approved** student cards only.
- Separate `/add-profile` page:
  - OTP send and verify (BulkSMS API format).
  - Profile submission with max 1MB image.
  - One phone number can create one profile.
- `/admin` page with token-based moderation:
  - View pending submissions.
  - Approve/reject profiles.
- Supabase database + storage.

## Stack

- Next.js 14 (App Router)
- Supabase Postgres + Storage
- OTP via BulkSMS API endpoint

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and set values.

3. In Supabase SQL editor, run:

```sql
-- db/schema.sql
```

4. Create storage bucket named `student-photos` (or set `SUPABASE_BUCKET`). Make bucket public.

5. Run locally:

```bash
npm run dev
```

## Environment Variables

See `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`
- `OTP_API_BASE_URL` (e.g. `http://bulksmsbd.net/api/smsapi`)
- `OTP_API_KEY`
- `OTP_SENDER_ID`
- `OTP_BRAND_NAME`
- `ADMIN_TOKEN`

## OTP API notes

This project integrates the URL-style API shown in your screenshot using query params:

- `api_key`
- `type=text`
- `number`
- `senderid`
- `message`

Phone input can be `01XXXXXXXXX` or `8801XXXXXXXXX`. The backend normalizes to `8801XXXXXXXXX` before OTP/session/profile operations.

It sends OTP using this template:

`<BrandName> OTP is XXXXXX. Don't share it with anyone.`

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel Project Settings.
4. Deploy.


## Vercel configuration

This repository includes `vercel.json` to force Next.js framework detection and use `.next` as build output.


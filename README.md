# Anah Website

Next.js storefront and admin panel for Anah by Sindhura Reddy.

## Stack

- Next.js 16
- React 19
- Prisma
- SQLite for the current temporary setup
- Razorpay
- Gmail SMTP via Nodemailer
- Playwright

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local env file with values for:

```bash
DATABASE_URL
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_WEBHOOK_SECRET
EMAIL_FROM
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
INSTAGRAM_ACCESS_TOKEN
INSTAGRAM_USER_ID
NEXT_PUBLIC_SITE_URL
```

3. Apply migrations and seed data:

```bash
npx prisma migrate deploy
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Tests

```bash
npm test
```

To view the Playwright report:

```bash
npm run test:report
```

## CI

GitHub Actions runs a build on every push to `main` and on pull requests. The workflow:

- installs dependencies
- applies Prisma migrations
- seeds the database
- runs `npm run build`

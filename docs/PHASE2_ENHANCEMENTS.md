# Phase 2 Enhancements (AI-Assisted)

This document summarizes the improvements added in Phase 2 and how to use them. Primary contributor: Abhijeet Halder. AI used as a helper for patterns and structure; all code was reviewed and integrated manually.

---

## Backend Enhancements

- Security hardening
  - helmet, morgan logging
  - CORS whitelist via CORS_ORIGIN (comma-separated). If unset, dev allows all origins.
- Observability and docs
  - Health: GET /api/health
  - Version: GET /api/version
  - Swagger UI: GET /api/docs (OpenAPI spec)
- Request auto-expiry and overdue monitoring
  - Pending requests auto-expire after 24h (returns inventory)
  - Overdue monitor flags items past returnDate as overdue
  - Admin/Staff can list overdues: GET /api/requests/overdue
- Analytics
  - GET /api/analytics/summary — status counts, top equipment, monthly trend
- Documentation updates
  - Backend README updated with new endpoints
  - .env.example extended (PORT=5001, CORS_ORIGIN, reCAPTCHA)

## Frontend Enhancements

- Navigation
  - SVG brand icon (no emojis)
  - Admin links for Overdues and Analytics
- Overdues page (Admin/Staff)
  - Table of overdue requests and quick “Mark Returned” action
- Analytics page (Admin/Staff)
  - Premium cards with SVG bar charts (no external chart libs)
  - Visualizations: status distribution, requests per month (6m), top borrowed equipment

---

## How to Run (Phase 2)

```bash
cd phase2-ai-enhanced
./manage.sh start
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- Swagger: http://localhost:5001/api/docs
- Health: http://localhost:5001/api/health

Environment variables (backend/.env):
- PORT=5001
- MONGODB_URI=mongodb://localhost:27017/equipment-lending
- JWT_SECRET=...
- JWT_EXPIRE=7d
- NODE_ENV=development
- CORS_ORIGIN=http://localhost:3000
- DEMO_MODE=true
- RECAPTCHA_SECRET_KEY=...
- SKIP_RECAPTCHA=false

---

## MailTrap Email Delivery (OTP/Reminders)

Phase 2 centralizes emailing with Nodemailer. Configure MailTrap (or any SMTP) via .env.

Required (MailTrap example):
```
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USER=<mailtrap_username>
EMAIL_PASSWORD=<mailtrap_password>
EMAIL_FROM="EquipShare Support" <noreply@equipshare.com>
# Optional
EMAIL_SERVICE=
FRONTEND_URL=http://localhost:3000
SUPPORT_EMAIL=support@equipshare.com
```

Notes:
- If DEMO_MODE=true and EMAIL_HOST is not set, emails are not sent; OTPs are logged to the server console for testing.
- Set DEMO_MODE=false when you want real emails via MailTrap.
- OTP emails: utils/emailService.sendOTPEmail(email, otp, expiry)
- Overdue reminders: utils/emailService.sendOverdueReminder(email, name, details)

---

## Developer Notes

- Overdue monitor runs every minute; acts on items with returnDate < now and status=approved.
- Overdues page performs whole-request return for speed. Fine-grained per-item return can be added if needed.
- CORS: if CORS_ORIGIN is set, whitelist is enforced; otherwise permissive in dev.
- Charts are pure SVG for portability and performance.

---

## Attribution (as per assignment policy)

- Lead developer: Abhijeet Halder — feature design, integration, testing, final polishing.
- AI assistance: suggested patterns (security middleware structure, SVG chart skeletons, docs outline). All outputs reviewed and adapted before inclusion.

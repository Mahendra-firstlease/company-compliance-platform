# 🛡️ FirstLease - Corporate Compliance Platform

A corporate compliance and statutory filing web application built for Indian businesses.

---

## ⚡ Quick Project Summary

FirstLease Compliance Platform simplifies corporate registrations, GST filings, trademark applications, and statutory annual compliances. It provides a seamless user onboarding experience, Razorpay payments, real-time filing progress tracking, and a dedicated Backoffice Admin Management Console.

---

## 🛠️ Main Tech Stack

* **Frontend & Backend:** Next.js 16 (App Router + Turbopack) & React 19
* **Styling:** Tailwind CSS & Lucide Icons
* **Database:** MySQL & Prisma ORM v6
* **Auth:** NextAuth.js (JWT Strategy)
* **Payments:** Razorpay Standard Checkout (HMAC Verification)

---

## 🚀 Quick Start Guide

```bash
# 1. Install dependencies
npm install

# 2. Sync database schema
npx prisma db push

# 3. Seed admin account & services catalog
npx tsx prisma/seed.ts

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔐 Default Admin Account

* **Email:** `admin@firstlease.com`
* **Password:** `Admin@12345`
* **Admin Portal:** `/admin`

# 🛡️ FirstLease - Corporate Compliance & Statutory Filing Platform

A modern, production-grade enterprise corporate compliance and statutory filing web application built with **Next.js 16 (App Router with Turbopack)**, **React 19**, **Tailwind CSS**, **Prisma ORM**, **MySQL**, and **Razorpay Standard Checkout**.

![Compliance Platform Banner](/public/images/services/incorporation.jpg)

---

## 🚀 Key Features & System Modules

### 1️⃣ **Dynamic Services Catalog & SEO Optimization**
- **15+ Statutory Compliance Services:** GST Registration, Private Limited Incorporation, FSSAI Food License, MSME Registration, Trademark Filing, and Annual ROC Compliances.
- **Server-Side Rendered (SSR) & Dynamic SEO:** Full metadata generation, OpenGraph tags, canonical URLs, and Google JSON-LD structured schemas (`Service`, `Organization`, `FAQPage`).

### 2️⃣ **2-Step Business Profile Onboarding (`/business-profile`)**
- **Entity Registration:** Collects Business Name, Entity Type, Industry Sector, State, Employee Count, and Annual Turnover.
- **Dynamic Location Integration:** State selection powered dynamically by `country-state-city`.
- **Recommendation Engine:** Calculates relevant statutory compliance packages tailored to the entity profile.
- **Mobile-Friendly Checkout Bar:** Responsive bottom summary bar for single and multi-service package purchases.

### 3️⃣ **Production Razorpay Payment Gateway Integration**
- **Backend Order Creation Endpoint (`POST /api/create-order`):** Generates Razorpay Order IDs with INR amounts in paise.
- **HMAC-SHA256 Signature Verification (`POST /api/verify-payment`):** Verifies cryptographic signatures using server secrets.
- **Unified Checkout Modal (`MultiServiceCheckoutModal.tsx`):** Handles single service and bundled multi-service package checkouts.
- **Graceful Error Handling:** Replaces infinite spinners with clear error alert banners and domestic Indian test card guidelines (`4585 0000 0000 0001` or `success@razorpay`).

### 4️⃣ **Filing Workspace & Progress Tracker Stepper (`/applications/[slug]`)**
- **5-Stage Timeline Stepper:** Dynamic progress line tracking filing lifecycles:
  1. `1. Payment Clear` (Green Checkmark ✅)
  2. `2. Upload Docs` (Active Pulsing Ring 🔵)
  3. `3. Verification` (Under Review ⚪)
  4. `4. Govt Filing` (Submitted to Ministry ⚪)
  5. `5. Issued` (Official Certificate ⚪)
- **Document Dropzone & Inspection:** PDF, PNG, and JPG attachment upload checks.
- **Tax Invoice & Certificate Downloads:** Instant client tax invoice generation.

### 5️⃣ **Backoffice Admin Case Management Portal (`/admin`)**
- **Live 3-Second Auto-Polling Queue:** Auto-surfaces incoming paid applications instantly.
- **Filter Tabs:** Filter queue by `New Paid`, `Under Review`, `Govt Submitted`, `Approved`, and `Queries Raised`.
- **In-App Document Inspector:** Review customer-uploaded files directly inside the drawer.
- **Specialist Allocation:** Assign Chartered Accountants (CA) and Company Secretaries (CS).
- **Query Alert Templates:** Send clarification query alerts (*"Address proof blurred"*, *"PAN name mismatch"*), triggering red workspace warning banners.

### 6️⃣ **Role-Based Security & Edge Middleware (`/middleware.ts`)**
- **NextAuth JWT Session Strategy:** Encrypted token authentication using `bcryptjs`.
- **Strict Bidirectional Route Isolation:**
  - Standard Clients (`role: "CLIENT"`) are strictly blocked from `/admin`.
  - Admins (`role: "ADMIN"`) are restricted to `/admin` to prevent workspace pollution.

---

## 🛠️ Technology Stack

| Component | Technology Used |
| :--- | :--- |
| **Framework** | Next.js 16.2.9 (App Router with Turbopack) & React 19 |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Headless UI |
| **Database & ORM** | MySQL Database & Prisma ORM v6 |
| **Authentication** | NextAuth.js (JWT Strategy) & bcryptjs |
| **Payment Gateway** | Razorpay Standard Web Checkout JS SDK & Crypto HMAC-SHA256 |
| **Forms & Validation** | React Hook Form, Zod Schemas |

---

## 📋 Environment Variables Setup

Create a `.env` file in the project root:

```env
# MySQL Database Connection
DATABASE_URL="mysql://root:password@localhost:3306/company_compliance_db"

# NextAuth Authentication
NEXTAUTH_SECRET="your_nextauth_secret_key_2026"
NEXTAUTH_URL="http://localhost:3000"

# Razorpay Payment Gateway Credentials (Test Mode)
RAZORPAY_KEY_ID="rzp_test_THDaGjZa5ExylM"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_THDaGjZa5ExylM"
RAZORPAY_KEY_SECRET="0An2xWcnlWO175ZuICJvKRx8"
```

---

## ⚙️ Local Installation & Setup Guide

### 1️⃣ **Clone & Install Dependencies**
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/company-compliance-platform.git
cd company-compliance-platform
npm install
```

### 2️⃣ **Database Migration & Seeding**
Sync Prisma ORM schemas with your MySQL database and seed initial services and master admin credentials:

```bash
# Push database schema to MySQL
npx prisma db push

# Seed default admin user & services catalog
npx tsx prisma/seed.ts
```

### 3️⃣ **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Seed User Credentials

| Account Type | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| 🛡️ **Master Admin** | `admin@firstlease.com` | `Admin@12345` | `/admin` |
| 👤 **Test Client** | `client@firstlease.com` | `Client@12345` | `/dashboard` |

---

## 📁 Directory Structure Overview

```
my-app/
├── prisma/
│   ├── schema.prisma             # MySQL Database Models (User, Application, Document, Payment)
│   └── seed.ts                   # Admin & Services Catalog Seeding Script
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login & Register Auth Routes
│   │   ├── (website)/            # Public Services, Dashboard, Profile, Applications & Admin
│   │   │   ├── admin/            # Backoffice Admin Case Management Portal (/admin)
│   │   │   ├── applications/     # Application Workspace Stepper Tracker (/applications/[slug])
│   │   │   ├── business-profile/ # 2-Step Business Profile Onboarding Hub
│   │   │   └── services/         # Services Catalog & Detail Pages
│   │   └── api/                  # Next.js API Route Handlers
│   │       ├── applications/     # Application CRUD API
│   │       ├── create-order/     # Razorpay Order Creation API
│   │       └── verify-payment/   # Razorpay HMAC Verification API
│   ├── components/               # Common UI Components, Forms, and Navigation
│   ├── features/                 # Modular Feature Components (Services, Checkout Modals)
│   ├── lib/                      # Helper Functions (Prisma, Razorpay, NextAuth, Notify)
│   └── middleware.ts             # Edge Middleware Role-Based Route Protection
├── README.md                     # Project Documentation
└── package.json                  # Dependencies & Build Scripts
```

---

## 🧪 Testing Checklist

- [x] Next.js 16 App Router build (`npx tsc --noEmit` & `npm run build` pass with 0 errors).
- [x] Razorpay Order Creation & HMAC-SHA256 signature verification.
- [x] Business Profile 2-step onboarding form with state lookup.
- [x] Stepper Progress Tracker transitions (`PAYMENT_CONFIRMED` ➔ `DOCUMENTS_PENDING` ➔ `APPROVED`).
- [x] Real-time Backoffice Admin Portal with live 3-second auto-polling and document inspection.

---

## 📄 License
This project is proprietary and confidential. Powered by **FirstLease Team**.

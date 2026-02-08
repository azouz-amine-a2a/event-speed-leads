# 🚀 Event Speed Leads - Lead Collection System

A professional single-event lead collection web application built with React, TypeScript, and Supabase. This system is designed for business events where staff collect potential client information through a fixed contact form, with three distinct user roles and comprehensive dashboards.

## ✨ Key Features

### 🔐 Role-Based Access Control

- **Super Admin**: Full platform control, event management, cross-platform CSV export, account deletion with confirmation dialogs
- **Account Owner**: Dashboard with analytics, staff management, bilingual interface (EN/FR), custom branding
- **Staff Worker**: Mobile-first contact form with branded full-screen splash screen and swipe-up gesture

### 🎨 Modern Design & UX

- **Fresh Color Palette**: Cyan (#5CE1E6) brand, Red (#FF5757) energy CTAs, Navy (#0F172A) premium text
- **Mobile-First**: Interactive splash screen with swipe-up gesture for contact form
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Branded Experience**: Custom logos and background images for events and account owners

### 🌍 Multi-Language Support

- English and French interfaces
- LocalStorage persistence for language preferences
- Every static word translates properly across dashboards

### 📊 Advanced Features

- **Event Management**: Create events with dates, industry sectors, logos, and backgrounds
- **Analytics Dashboard**: Visual charts showing leads collected by staff workers
- **CSV Export**: Account owners export their data; Super admins export all data organized by events
- **Differentiated Security**: Account owners require current password for changes; Super admins bypass verification
- **Auto-Reset Forms**: Contact form resets to splash screen after each submission

---

## 🎨 Customization

**📖 [Icon Customization Guide](./ICON-CUSTOMIZATION-GUIDE.md)** - Change favicon and dashboard icons

This guide covers:
- How to change the browser tab icon (favicon)
- How to change icons in the Super Admin dashboard
- How to change icons in the Account Owner dashboard

---

## 🎯 User Roles & Capabilities

| Feature | Super Admin | Account Owner | Staff Worker |
|---------|-------------|---------------|--------------|
| Event Management | ✅ Create/Edit/Delete | ❌ | ❌ |
| Dashboard Access | ✅ Always | ✅ Always | ⚠️ Only when event active |
| Staff Management | ✅ View all | ✅ Own staff only | ❌ |
| CSV Export | ✅ All data by events | ✅ Own data only | ❌ |
| Branding Upload | ✅ Event assets | ✅ Company assets | ❌ |
| Language Switch | ❌ | ✅ EN/FR | ❌ |
| Contact Form | ❌ | ❌ | ✅ Mobile-first |
| Password Change | ✅ No verification | ✅ Requires current password | ✅ Requires current password |
| Account Deletion | ✅ With confirmation | ❌ | ❌ |

---

## 📂 Project Structure

```
event-speed-leads/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   └── figma/           # Image handling components
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.tsx  # Authentication & user state
│   │   │   ├── EventContext.tsx # Active event state
│   │   │   └── LanguageContext.tsx # Multi-language support
│   │   ├── pages/               # Application pages
│   │   │   ├── LoginPage.tsx    # Universal login
│   │   │   ├── StaffContactForm.tsx # Mobile-first form
│   │   │   ├── admin/           # Super Admin dashboard
│   │   │   └── owner/           # Account Owner dashboard
│   │   ├── config/              # Configuration files
│   │   │   └── branding.ts      # Platform branding config
│   │   ├── types/               # TypeScript definitions
│   │   └── routes.tsx           # React Router configuration
│   ├── lib/
│   │   ├── api.ts               # Supabase API functions
│   │   └── supabase.ts          # Supabase client
│   └── styles/                  # Global styles (Tailwind v4)
├── public/                      # Static assets (favicon, etc.)
├── index.html                   # HTML entry point
├── ICON-CUSTOMIZATION-GUIDE.md  # 📖 Icon & favicon guide
└── package.json
```

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS v4 (modern design system)
- React Router v7 (routing)
- Vite (build tool)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Supabase Storage (image uploads)

**UI Libraries:**
- Radix UI (accessible components)
- Lucide React (icons)
- Recharts (analytics charts)
- Sonner (toast notifications)

---

## 📄 License

Copyright © 2026 PhoenixCom. All rights reserved.

---

**Built with ❤️ by [PhoenixCom](https://phenixcom.consulting)**

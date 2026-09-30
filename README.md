# Mudiraj Community Membership & Organization Management System (Andhra Pradesh)

A complete, production-ready **Next.js (React.js App Router)** web application built in **100% pure JavaScript & React `.jsx`** inside the **`src/`** directory for managing the **Andhra Pradesh Mudiraj Community** membership applications, 20+ lakh member database capacity, 5-tier organizational hierarchy, and reusable leadership teams.

---

## 1. Quick Start (Runs Immediately with Local Database)

No external database configuration is required to start the application. On first run, the system automatically initializes a persistent local database (`data/mudiraj_db.json`) pre-seeded with Andhra Pradesh Districts, Constitutions, Mandals, Reusable Teams (`Main Team`, `Youth Team`, `Mahila Team`), and sample community records.

```bash
npm install
npm run dev
```

Open **`http://localhost:3000`** in Microsoft Edge, Google Chrome, or Mozilla Firefox.

---

## 2. Project Structure (`src/` Directory with `.jsx` Frontend Files)

```text
src/
├── app/
│   ├── page.jsx
│   ├── layout.jsx
│   ├── globals.css
│   ├── about/page.jsx
│   ├── membership/page.jsx
│   ├── apply/page.jsx
│   ├── organization/page.jsx
│   ├── leadership/page.jsx
│   ├── contact/page.jsx
│   ├── login/page.jsx
│   ├── admin/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── members/page.jsx
│   │   ├── applications/page.jsx
│   │   ├── organizations/page.jsx
│   │   ├── teams/page.jsx
│   │   ├── leaders/page.jsx
│   │   ├── reports/page.jsx
│   │   └── settings/page.jsx
│   └── api/
│       ├── auth/
│       ├── public/
│       └── admin/
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Sidebar.jsx
│   ├── MemberForm.jsx
│   ├── MemberTable.jsx
│   ├── TeamCard.jsx
│   └── OrganizationTree.jsx
├── lib/
│   ├── auth.js
│   ├── database.js
│   ├── members.js
│   ├── organizations.js
│   ├── teams.js
│   ├── membershipId.js
│   └── validation.js
└── services/
    ├── memberService.js
    ├── organizationService.js
    └── teamService.js
```

---

## 3. Access Levels & Default Admin Credentials

### Public Website (No Login Required)
- **Home**: `/`
- **About Mudiraj Community**: `/about`
- **Verify Membership / Track Application Status**: `/membership`
- **Apply for Membership**: `/apply`
- **Organization Hierarchy Explorer**: `/organization`
- **Leadership Committees Directory**: `/leadership`
- **Contact & District Offices**: `/contact`

### Administrator Portal (`/login` & `/admin/*`)
- **Admin Login URL**: `/login`
- **Default Username**: `admin` (or `admin@mudiraj.org`)
- **Default Password**: `Admin@123`

# IGAC MUN Certificate Admin Portal

A modern admin dashboard for managing MUN (Model United Nations) certificates, built with Next.js 15, Supabase, and Tailwind CSS.

<p align="center">
  <img src="public/logo%20(2).png" alt="IGAC Logo" width="200">
</p>

---

## 🎯 What is this?

This is the **Admin Portal** for IGAC MUN's certificate management system. It allows organizers to:

- **Issue certificates** to delegates, secretariat, executive board members, campus ambassadors, and volunteers
- **Sync data** from Google Sheets (bulk import)
- **Manage certificates** - view, edit, revoke
- **Track verifications** - see who verified their certificates
- **Manage users** - approve new admin accounts

### Two Connected Systems

| System | URL | Purpose |
|--------|-----|---------|
| **Admin Portal** (this) | `your-domain.vercel.app` | Manage & issue certificates |
| **Certificate Portal** | `igacmun.vercel.app` | Public verification page |

Both share the same Supabase database.

---

## ✨ Features

### 🏠 Dashboard
- Overview statistics (total certificates, active, revoked)
- Recent activity feed
- Quick actions

### 📜 Certificate Management
- View all certificates with search & filters
- Edit certificate details (name, school, award, metadata)
- Revoke/restore certificates
- Category-aware fields:
  - **Delegates**: Committee + Country
  - **Executive Board**: Committee + Position (Chair, Vice Chair, Rapporteur)
  - **Secretariat**: Department + Designation
  - **Campus Ambassador**: Basic info only

### ➕ Manual Creation
- Create individual certificates with form validation
- Auto-generated unique IDs (6-7 character alphanumeric)
- Optional sync to Google Sheet
- Award type suggestions

### 🔄 Google Sheets Sync
- Import certificates from Google Sheets (via SheetDB API)
- Bi-directional sync support
- Automatic ID generation for new entries
- Rate limiting to avoid API limits

### 📊 Analytics
- Verification trends over time
- Certificate distribution by type
- Event-based statistics
- Recent verification logs

### 👥 User Management (Super Admin only)
- Approve/reject new registrations
- Change user roles (admin/mod)
- Delete users
- View all registered accounts

### 🔐 Role-Based Access Control
| Role | Permissions |
|------|-------------|
| `super_admin` | Full access + user management + approve registrations |
| `admin` | Create, edit, delete certificates |
| `mod` | View only access |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database & auth)
- SheetDB account (for Google Sheets sync)
- Discord webhooks (optional, for notifications)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/certificate-admin.git
cd certificate-admin

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the dashboard.

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SheetDB - Google Sheets sync (Required for sync feature)
SHEETDB_API_URL=https://sheetdb.io/api/v1/your-sheet-id

# Discord Webhooks (Optional - for notifications)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_ERROR_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Certificate Portal URL
NEXT_PUBLIC_CERTIFICATE_PORTAL_URL=https://igacmun.vercel.app/certificate-portal

# Default Event
DEFAULT_EVENT_NAME=igacmun-session-3-2025
```

---

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Login, logout, register, me
│   │   ├── certificates/      # CRUD operations
│   │   ├── events/            # Event management
│   │   ├── logs/              # Verification logs
│   │   ├── stats/             # Dashboard statistics
│   │   ├── sync/              # Google Sheets sync
│   │   └── users/             # User management
│   ├── dashboard/             # Protected admin pages
│   │   ├── analytics/         # Analytics & charts
│   │   ├── certificates/      # Certificate list & edit
│   │   ├── create/            # Manual certificate creation
│   │   ├── events/            # Event management
│   │   ├── export/            # Export certificates
│   │   ├── import/            # Bulk import
│   │   ├── logs/              # Verification logs
│   │   ├── settings/          # Settings + user management
│   │   ├── sheet/             # View Google Sheet data
│   │   └── sync/              # Sync controls
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── error.tsx              # Error boundary
│   ├── loading.tsx            # Global loading state
│   └── not-found.tsx          # 404 page
├── components/
│   ├── ui/                    # Reusable UI components
│   │   └── index.tsx          # Toggle, Badge, Tooltip, Card, etc.
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── DashboardLayout.tsx    # Main layout wrapper
├── lib/
│   ├── supabase/              # Supabase clients (admin, client, server)
│   └── utils/                 # Helper functions
│       ├── auth.ts            # Authentication helpers
│       ├── cache.ts           # Caching utilities
│       ├── certificates.ts    # Certificate validation & generation
│       ├── discord.ts         # Discord webhook notifications
│       └── sheetdb.ts         # SheetDB API wrapper
├── types/
│   └── database.ts            # TypeScript types
└── public/
    └── logo (2).png           # IGAC logo
```

---

## 🎨 Brand Colors

The dashboard uses IGAC's official brand colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Dark | `#000b07` | Main background |
| Dark Alt | `#001c14` | Card backgrounds |
| Cream | `#ffeccd` | Primary accent, buttons |
| Cream Light | `#faf4ea` | Text color |

```css
/* Tailwind usage */
bg-[#000b07]     /* Main background */
bg-[#001c14]     /* Cards */
text-[#ffeccd]   /* Accent text */
text-[#faf4ea]   /* Primary text */
```

---

## 🗄️ Database Schema

### `certificates` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `certificate_id` | text | Unique short ID (e.g., "abc123") |
| `certificate_type` | text | Award name (e.g., "Best Delegate") |
| `participant_name` | text | Full name |
| `school` | text | Institution |
| `event_id` | uuid | Foreign key to events |
| `status` | text | 'active' or 'revoked' |
| `date_issued` | date | Issue date |
| `qr_code_data` | text | Verification URL |
| `created_by` | uuid | User who created it |

### `certificate_metadata` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `certificate_id` | uuid | Foreign key to certificates |
| `field_name` | text | e.g., 'committee', 'country', 'position' |
| `field_value` | text | The value |
| `field_type` | text | 'text' |

**Metadata field names by category:**
- **Delegate**: `cert_type`, `email`, `committee`, `country`
- **Executive Board**: `cert_type`, `email`, `committee`, `position`
- **Secretariat**: `cert_type`, `email`, `department`, `designation`
- **Campus Ambassador**: `cert_type`, `email`

### `users` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (matches auth.users) |
| `email` | text | User email |
| `role` | text | 'super_admin', 'admin', 'mod' |
| `account_status` | text | 'pending_approval', 'approved', 'rejected' |
| `approved_by` | uuid | Who approved the account |
| `approved_at` | timestamp | When approved |

---

## 📋 Google Sheet Structure

Your Google Sheet should have these columns:

| Column | Description | Who Fills |
|--------|-------------|-----------|
| `Cert_Type` | Category (delegate, secretariat, etc.) | Admin |
| `Participant_Name` | Full name | Admin |
| `Email` | Email address | Admin |
| `institution` | School/organization (lowercase!) | Admin |
| `Award_Type` | Certificate name (Best Delegate, etc.) | Admin |
| `Committee` | Committee name OR Department | Admin |
| `Country` | Country OR Designation | Admin |
| `Unique_ID` | Generated certificate ID | System |
| `Verification_URL` | Public verification link | System |
| `Date_Issued` | Issue date | System |
| `Verified_Status` | 'active' or 'revoked' | System |
| `Event_Name` | Event code | System |

---

## 🔐 User Registration

New admin accounts require approval:

1. Go to `/register`
2. Enter email, password, and the **secret signup code**
3. Select role (Admin or Moderator)
4. Wait for a super_admin to approve your account
5. Once approved, you can log in

> **Note**: The signup code is required to register. Ask a super admin for the code.

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/register` | Register new account |

### Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certificates` | List certificates (paginated) |
| POST | `/api/certificates/create` | Create single certificate |
| GET | `/api/certificates/[id]` | Get certificate details |
| PUT | `/api/certificates/[id]` | Update certificate |
| DELETE | `/api/certificates/[id]` | Delete certificate |
| POST | `/api/certificates/export` | Export certificates |
| POST | `/api/certificates/import` | Bulk import |

### Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sync/from-sheet` | Import from Google Sheet |
| POST | `/api/sync/to-sheet` | Export to Google Sheet |
| GET | `/api/sheet` | View sheet data |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/events` | List events |
| GET | `/api/logs/verifications` | Verification logs |
| GET/PUT/DELETE | `/api/users` | User management |

---

## 🔄 Rate Limiting

SheetDB has rate limits on free tier. The app handles this with:
- 1 second delay between requests
- Exponential backoff on 429 errors
- Batch processing (5 at a time with delays)
- Retry logic (up to 3 retries)

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Make sure to:
1. Add all environment variables in Vercel dashboard
2. Set the build command to `npm run build`
3. Set the output directory to `.next`

### Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase URL whitelist includes Vercel domain
- [ ] Test login with super_admin account
- [ ] Test certificate creation
- [ ] Test Google Sheets sync
- [ ] Verify Discord webhooks work

---

## 🤝 Contributing

This is an internal tool for IGAC MUN. For issues or feature requests, contact the development team.

---

## 📞 Support

- **Discord**: IGAC MUN Server
- **Email**: Contact your organization admin

---

<p align="center">
  <i>Built with ❤️ for IGAC MUN</i>
</p>

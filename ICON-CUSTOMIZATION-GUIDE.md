# 🎨 Icon Customization Guide

## 1. Change Browser Tab Icon (Favicon)

### Current Favicon Location:
```
/public/vite.svg
```

### Step-by-Step Instructions:

1. **Generate your favicon** at [favicon.io](https://favicon.io/) or use any image editor

2. **Replace the file:**
   - Delete: `/public/vite.svg`
   - Add your new favicon file (e.g., `favicon.ico` or `favicon.png`)

3. **Update `/index.html`:**

**Current code (line 5-6):**
```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

**Change to (for .ico file):**
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

**Or (for .png file):**
```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

4. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)

---

## 2. Change Admin Dashboard Icons

### File Location:
```
/src/app/pages/admin/AdminDashboard.tsx
```

### Current Icons (Line 5):
```typescript
import { 
  Building,        // Companies icon
  BarChart3,       // Analytics icon
  Settings,        // Settings icon
  LogOut,          // Logout icon
  Shield,          // Security/Admin icon
  Calendar,        // Events/Calendar icon
  Database,        // Data/Database icon
  Menu,            // Mobile menu open
  X,               // Mobile menu close
  LayoutDashboard  // Dashboard icon
} from 'lucide-react';
```

### How to Change:

1. **Browse available icons:** Visit [lucide.dev/icons](https://lucide.dev/icons)

2. **Find where each icon is used in the file:**

   - `Building` - Companies section
   - `BarChart3` - Analytics section
   - `Settings` - Settings section
   - `Shield` - Super Admin indicators
   - `Calendar` - Event Management
   - `Database` - Data exports
   - `LayoutDashboard` - Dashboard overview

3. **Replace an icon:**

**Example - Change the Analytics icon from `BarChart3` to `TrendingUp`:**

```typescript
// Line 5 - Change the import:
import { 
  Building,
  TrendingUp,      // ← Changed from BarChart3
  Settings,
  // ... rest of icons
} from 'lucide-react';
```

Then find where `BarChart3` is used in the JSX and replace it with `TrendingUp`.

---

## 3. Change Account Owner Dashboard Icons

### File Location:
```
/src/app/pages/owner/OwnerDashboard.tsx
```

### Current Icons (Line 6):
```typescript
import { 
  Building2,    // Company/Building icon
  BarChart3,    // Analytics icon
  Users,        // Staff/People icon
  FileDown,     // CSV Download icon
  Settings,     // Settings icon
  LogOut,       // Logout icon
  Menu,         // Mobile menu open
  X             // Mobile menu close
} from 'lucide-react';
```

### How to Change:

1. **Browse available icons:** Visit [lucide.dev/icons](https://lucide.dev/icons)

2. **Find where each icon is used:**

   - `Building2` - Company/Dashboard icon
   - `BarChart3` - Analytics section
   - `Users` - Staff Workers section
   - `FileDown` - CSV Export button
   - `Settings` - Settings section

3. **Replace an icon:**

**Example - Change Staff Workers icon from `Users` to `UserCheck`:**

```typescript
// Line 6 - Change the import:
import { 
  Building2,
  BarChart3,
  UserCheck,    // ← Changed from Users
  FileDown,
  Settings,
  // ... rest of icons
} from 'lucide-react';
```

Then find where `Users` (now `UserCheck`) is used in the JSX code.

---

## Quick Reference

### Icon Search Tips:

| Looking for... | Search on lucide.dev |
|----------------|---------------------|
| People/Team icons | "user", "users", "people" |
| Business icons | "building", "briefcase", "office" |
| Data/Analytics | "chart", "graph", "trending" |
| Settings/Config | "settings", "cog", "tool" |
| Files/Documents | "file", "document", "folder" |
| Actions | "download", "upload", "edit" |
| Navigation | "menu", "arrow", "chevron" |

### Common Lucide Icons:

```typescript
// Popular icons you might want to use:
import {
  Home,           // Home page
  TrendingUp,     // Growth/Analytics
  UserCheck,      // Verified users
  Download,       // Downloads
  Upload,         // Uploads
  Edit,           // Edit actions
  Trash,          // Delete actions
  CheckCircle,    // Success/Completion
  AlertCircle,    // Warnings
  Info,           // Information
  Search,         // Search functionality
  Filter,         // Filtering
  Plus,           // Add/Create
  Minus,          // Remove/Decrease
  Check,          // Checkmarks
} from 'lucide-react';
```

---

## Important Notes:

1. **Icon names are case-sensitive** - Use exact names from lucide.dev
2. **After changing icons, restart your dev server** (`pnpm dev`)
3. **Search-and-replace** - When changing an icon, find ALL occurrences of the old icon name in the file
4. **Keep imports clean** - Remove unused icon imports to keep code clean

---

## Example: Complete Icon Change

Let's say you want to change the Account Owner dashboard "Staff Workers" icon from `Users` to `UserCheck`:

### Step 1: Update Import (Line 6)
```typescript
// Before:
import { Building2, BarChart3, Users, FileDown, Settings, LogOut, Menu, X } from 'lucide-react';

// After:
import { Building2, BarChart3, UserCheck, FileDown, Settings, LogOut, Menu, X } from 'lucide-react';
```

### Step 2: Find and Replace in JSX
Search for `<Users` in the file and replace with `<UserCheck`

**Example location (around line 150-200):**
```typescript
// Before:
<Users className="size-5" />

// After:
<UserCheck className="size-5" />
```

### Step 3: Save and Refresh
- Save the file
- Browser will hot-reload automatically
- New icon appears! ✅

---

**Icon Library:** [lucide.dev/icons](https://lucide.dev/icons)  
**Total Available Icons:** 1000+ icons

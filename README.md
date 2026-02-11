# Babu Brands Garage POS

A lightweight front-end POS + garage records system with:

- Parent container authentication gate with account-based access control.
- Super admin account creation for temporary trial (`3 hours` or `6 hours`) or subscription (`30 days`).
- Auto lockout when account expiry time is reached.
- Customer and vehicle registry.
- Service job tracking with labor + parts estimate.
- POS sales log with same-day sales total.
- Local persistence using browser localStorage.

## Parent account model

Default super admin login:
- Username: `superadmin`
- Password: `babu@super`

From the super admin panel, create admin accounts with plan dropdown:
- Temporary Trial (3 hours)
- Temporary Trial (6 hours)
- Subscription (30 days)

## Run locally (plug-and-play)

### Windows (double-click launcher)

- Double-click `start-pos.bat`
- Or run in Command Prompt:

```bat
start-pos.bat
```

Custom port:

```bat
start-pos.bat 4173
```

### Linux/macOS (one command)

```bash
./start-pos.sh
```

Default URL:
- <http://localhost:8080>

## Publish online (public link instead of localhost)

Yes, this is possible. A public URL like `https://your-app-name.netlify.app` or `https://your-app-name.vercel.app` can be used.

### Option A: Netlify (fastest)
1. Push this repository to GitHub.
2. In Netlify, click **Add new site** → **Import from Git**.
3. Choose the repo, no build command needed, publish directory: `.`
4. Deploy and Netlify will give you a public HTTPS URL.

### Option B: Vercel
1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Framework preset: **Other**, no build command needed.
4. Deploy and use the generated public HTTPS URL.

## Branding note

The header currently uses a BB gradient mark placeholder. Replace it with your provided logo image once it is added to the repo (e.g. `assets/babu-brands-logo.png`).

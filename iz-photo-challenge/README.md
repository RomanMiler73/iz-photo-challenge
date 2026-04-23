# IŽ Photo Challenge

A web-based photo contest platform built for the island of Iž, Croatia. Participants upload photos by scanning a QR code on posters placed around Iž. Members of a closed Facebook group vote for their favourites during a configured time window. Winners are announced once voting closes.

---

## Live App

**URL:** https://iz-photo-challenge.netlify.app *(update with actual Netlify URL)*

**Pages:**
- `/#upload` — Submit a photo (default, public)
- `/#gallery` — Browse all submissions (public)
- `/#slideshow` — Fullscreen presentation mode (public)
- `/#vote` — Cast votes, Facebook login required
- `/#results` — View winners, admin password required
- `/#admin` — Control panel, admin password required

**Admin password:** `UndaIDenas2026!`

---

## Architecture

### Tech Stack

| Layer | Service | Purpose |
|---|---|---|
| Frontend | React + Vite | Single page app, hash routing |
| Database + Auth | Supabase (free tier) | Data storage, Facebook OAuth |
| Photo Storage | Cloudinary (free tier) | Image hosting, CDN delivery, auto-compression |
| Hosting | Netlify (free tier) | Frontend deployment, auto-deploy from GitHub |
| Version Control | GitHub | Code repository |

### Infrastructure Accounts

| Service | Account | Key Details |
|---|---|---|
| GitHub | RomanMiler73 | Repo: `iz-photo-challenge` |
| Supabase | — | Project URL: `https://gejdqosoxhsdosntgali.supabase.co` |
| Cloudinary | — | Cloud name: `drfhb8zou`, Upload preset: `iz_photo_upload` |
| Netlify | RomanMiler73 | Auto-deploys on every push to `main` |
| Facebook Developers | — | App: `IŽ Photo Challenge`, App ID: `936296302649258` |

### Database Schema (Supabase)

**`photos`**
```sql
id uuid PK
name text
country text
comment text (nullable)
image_url text
thumbnail_url text
submitted_at timestamptz
```

**`votes`**
```sql
id uuid PK
voter_fb_id text
photo_id uuid FK → photos.id
voted_at timestamptz
UNIQUE(voter_fb_id, photo_id)
```

**`settings`** (single row, id = 1)
```sql
id int PK
vote_start timestamptz
vote_end timestamptz
winners_count int (default 3)
```

### Photo Processing

- User selects photo on phone
- Browser compresses client-side via Canvas API — max 2000px, max 2MB
- Compressed image uploaded to Cloudinary
- Cloudinary serves two versions:
  - Full size: `w_2000,q_auto,f_auto` — used in slideshow and lightbox
  - Thumbnail: `w_600,c_fill,q_auto,f_auto` — used in gallery and voting

### Free Tier Capacity

| Resource | Limit | Estimated capacity |
|---|---|---|
| Supabase DB | 500MB | Thousands of records |
| Cloudinary Storage | 25GB | ~12,000 photos at 2MB each |
| Cloudinary Bandwidth | 25GB/month | Monitor if slideshow gets heavy use |
| Netlify Bandwidth | 100GB/month | Not a concern |

---

## Project Structure

```
iz-photo-challenge/
├── index.html
├── package.json
├── vite.config.js
├── .env                          ← local dev only, not committed to Git
├── .gitignore
└── src/
    ├── main.jsx                  ← React entry point
    ├── App.jsx                   ← Hash router + nav + footer
    ├── styles/
    │   └── global.css            ← All styles
    ├── lib/
    │   ├── supabase.js           ← Supabase client
    │   ├── cloudinary.js         ← Upload + compression helper
    │   └── countries.js          ← Full world country list
    └── pages/
        ├── Upload.jsx            ← Photo submission form
        ├── Gallery.jsx           ← Masonry grid, pagination, lightbox
        ├── Slideshow.jsx         ← Fullscreen auto-advancing slideshow
        ├── Vote.jsx              ← Facebook login + ballot UI
        ├── Results.jsx           ← Winners display (admin gated)
        └── Admin.jsx             ← Control panel (admin gated)
```

---

## Environment Variables

Set in Netlify dashboard under Project Configuration → Environment Variables.

```
VITE_SUPABASE_URL=https://gejdqosoxhsdosntgali.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon key>
VITE_CLOUDINARY_CLOUD_NAME=drfhb8zou
VITE_CLOUDINARY_UPLOAD_PRESET=iz_photo_upload
```

For local development, create a `.env` file in the project root with the same values. The `.env` file is gitignored and never committed.

---

## Deployment

The app auto-deploys to Netlify on every push to the `main` branch.

**To deploy a change:**
```bash
git add .
git commit -m "Description of change"
git push
```

Netlify detects the push, runs `npm run build`, and publishes the `dist` folder. Deployment takes approximately 30-60 seconds.

**Netlify build settings:**
- Base directory: `iz-photo-challenge`
- Build command: `npm run build`
- Publish directory: `iz-photo-challenge/dist`

---

## Pages — Feature Summary

### Upload (`/#upload`)
- Public, no login required
- Fields: Name, Country (full world dropdown), Comment (optional, 300 chars)
- Photo compressed client-side before upload
- On submit → redirects to Gallery

### Gallery (`/#gallery`)
- Public
- Masonry grid, latest photo top-left
- 24 photos per page, paginated
- Click any photo → lightbox with full image, name, country, comment
- Links to Slideshow and Vote

### Slideshow (`/#slideshow`)
- Public
- Fullscreen, one photo at a time
- Auto-advances every 10 seconds, loops continuously
- Shows name, country, comment
- Manual prev/next controls, keyboard arrow support
- Progress bar at bottom

### Vote (`/#vote`)
- Requires Facebook Login (via Supabase OAuth)
- Voting window enforced server-side from settings table
- Select up to 5 photos, submit once — permanently locked
- States: not started / active / already voted (read-only) / closed
- Duplicate votes prevented by unique DB constraint

### Results (`/#results`)
- Admin password required
- Shows top N winners ranked by vote count (N configured in Admin)
- Gold / silver / bronze styling for top 3
- Only meaningful after voting closes

### Admin (`/#admin`)
- Admin password required
- Dashboard: total photos, unique voters, voting status
- Configure: voting open/close datetime, number of winners
- Copy voting link button (for posting in Facebook group)
- Reset contest: delete all photos and votes (with confirmation dialog)
- Sign out button

---

## Voting Flow

1. Admin sets voting start and end dates in Admin panel
2. Admin posts voting link in closed Facebook group *Iz misto moje od dva slova*
3. Members click link → land on `/#vote`
4. Click **Login with Facebook** → Supabase OAuth → Facebook → redirect back
5. Select up to 5 photos → Submit Ballot → confirmation dialog → locked
6. After deadline → Admin views results at `/#results`

### Voting Integrity
- Facebook OAuth — one FB account = one voter identity
- Unique constraint on `(voter_fb_id, photo_id)` at database level
- Voting window validated against server time, not client device time
- Once submitted, ballot is read-only — cannot be changed

---

## Admin Operations

### Reset the contest (delete all photos and votes)
**Option A — Admin page button:**
Go to `/#admin` → scroll to Danger Zone → click Reset Contest button → confirm.

**Option B — Supabase SQL Editor:**
```sql
delete from votes;
delete from photos;
```

### Manually check data
Go to supabase.com → Table Editor → select `photos` or `votes` table.

---

## Known Issues & Notes

- Facebook Login shows an email scope error to the app developer account only. Regular users (group members) are not affected by this and can log in normally.
- Cloudinary image files are not deleted when photos are reset via the Admin page — only DB records are removed. Images remain on Cloudinary but are no longer referenced. For a full cleanup, delete images manually in the Cloudinary dashboard.

---

## To Do

### 1. Fix Voting
Facebook Login via Supabase OAuth is not working correctly. Symptoms: blank page after clicking Login with Facebook, or email scope error shown to the app developer account. Needs investigation into the Supabase Facebook provider configuration, OAuth redirect URIs, and scope settings. The email scope error is developer-only and does not affect regular users, but the blank page redirect issue prevents voting from working end-to-end.

### 2. Photo Moderation — Brainstorm
Currently photos are auto-published immediately on upload with no review step. For a future version, consider an admin approval flow to prevent offensive or inappropriate submissions appearing in the public gallery. Points to consider:
- Admin receives a notification when a new photo is submitted
- Photo is held in a pending state — visible in admin but not in public gallery or voting
- Admin can approve or reject with one click
- Rejected photos are deleted or flagged with a reason
- This requires an additional status field on the photos table (e.g. pending / approved / rejected)
- Consider whether the uploader should be notified on rejection (would require collecting an email)
- Implementation complexity: medium — DB change + admin UI additions + gallery filter update

### 3. Complete About Page
The About page exists as a placeholder at /#about. Content to be written and provided by the organiser. The page is already in the nav and wired up — just needs text.

---

## Credits

By RM from *Puno dičine* for **Iž u srcu**

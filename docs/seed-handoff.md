# MOTD (Mukhawar of the Day) — Seed Data Handoff

Local dev database populated by `npm run seed` in `backend/`. Schema reference: [`docs/schema.md`](schema.md).

**Shared password (all seed accounts):** `MotdSeed123!`

---

## How to seed

```bash
cd backend
npm run seed
```

Requires MongoDB at `MONGODB_URI` (default `mongodb://127.0.0.1:27017/motd`) and `NODE_ENV` ≠ `production`. The script clears all collections, reseeds, and runs verification checks.

---

## Test logins

| Role | Email | Notes |
|---|---|---|
| Admin | `admin@motd.test` | Full admin access |
| Tailor (approved) | `ayesha@motd.test` | Shop: `ayesha-al-riaz`, 4 designs |
| Tailor (approved) | `asma@motd.test` | Shop: `asma-al-naeem`, 3 designs |
| Tailor (pending) | `fatima@motd.test` | No shop — use for approval-flow testing |
| Fabric store | `hanayan@motd.test` | Lists 3 fabrics |
| Fabric store | `mauzan@motd.test` | Lists 3 fabrics |
| Fabric store | `sharjah@motd.test` | Lists 3 fabrics |

Auth: `POST /api/users/signin` with `{ "email", "password" }`.

---

## Sample slugs (API / frontend integration)

### Ready-made products

| Slug | Name | Price (AED) |
|---|---|---|
| `emirati-silver-kandura` | Emirati Silver Kandura | 850 |
| `luxury-orange-abaya` | Luxury Orange Abaya | 1,250 |
| `royal-blue-bisht` | Royal Blue Bisht | 3,900 |

### Fabrics

| Slug | Store | Price/m (AED) |
|---|---|---|
| `emirati-silk-brocade` | Hanayan Fabrics | 450 |
| `abu-dhabi-cashmere` | Mauzan Textiles | 890 |
| `sharjah-cotton-linen` | Sharjah Heritage Fabrics | 195 |
| `pearl-divers-cotton` | Hanayan Fabrics | 165 |

(Full set: 9 fabrics — see seed output or MongoDB `fabrics` collection.)

### Tailor shops

| Slug | Owner | Designs |
|---|---|---|
| `ayesha-al-riaz` | ayesha@motd.test | `classic-emirati-kandura`, `executive-tailored-thob`, `heritage-jalabiya`, `modern-linen-abaya` |
| `asma-al-naeem` | asma@motd.test | `royal-ceremonial-bisht`, `court-evening-abaya`, `heritage-mukhawar` |

---

## Expected document counts

| Collection | Count |
|---|---|
| users | 7 |
| platformsettings | 1 |
| readymadeproducts | 3 |
| fabrics | 9 |
| tailorshops | 2 |
| designs | 7 |
| retailorders | 0 |
| customorders | 0 |

---

## Platform settings (singleton)

- Delivery fee: AED 35  
- Default tailoring fee: AED 150  
- VAT: 5%  
- Currency: AED  

---

## Slack / ClickUp paste (copy below)

```
MOTD seed data is ready for local dev.

Seed: cd backend && npm run seed
Schema: docs/schema.md
Handoff: docs/seed-handoff.md

Password (all accounts): MotdSeed123!

Logins:
- Admin: admin@motd.test
- Approved tailors: ayesha@motd.test, asma@motd.test
- Pending tailor: fatima@motd.test

Sample slugs:
- Ready-made: emirati-silver-kandura, luxury-orange-abaya, royal-blue-bisht
- Fabric: emirati-silk-brocade, abu-dhabi-cashmere, sharjah-cotton-linen
- Tailor shop: ayesha-al-riaz, asma-al-naeem
- Design: classic-emirati-kandura, royal-ceremonial-bisht
```

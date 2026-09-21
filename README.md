# MurtiPuja — Phase 1 + Phase 2

**Phase 1:** Project Setup + Mobile OTP Authentication
**Phase 2:** Product Catalog + Listing (SSR/ISR) + Product Detail + Cart

This includes everything from Phase 1, plus:
- Product & Category models (with **size/finish variants**, each with its own price/stock — matches the spec's DB schema)
- Cart model supporting both **logged-in users and guests** (guest cart persists via a `x-guest-id` header/localStorage, and would carry over once you wire up cart-merge-on-login in a later phase)
- Product listing API — filtered, paginated (never returns the whole catalog at once — see Section 9 performance notes)
- Admin-protected product CRUD routes (create/update/delete require `role: "admin"`)
- Next.js product listing page (`/products`) and product detail page (`/products/[slug]`) — both server components using ISR (`revalidate: 300`), with `generateMetadata` and schema.org JSON-LD for SEO
- Full cart flow: add to cart (with variant + quantity selection), update quantity, remove item — client-rendered, backed by `CartContext`
- `seed.js` script with 2 sample products (including a Shiva murti) so you can see real data immediately

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGODB_URI` — get this from MongoDB Atlas (free tier is fine to start)
- `JWT_SECRET` — any long random string
- `MSG91_AUTH_KEY` / `MSG91_TEMPLATE_ID` — **optional for now**. If left
  blank, the server runs in dev mode and just prints the OTP to your
  terminal console instead of sending a real SMS — perfect for testing
  the flow before you sign up with MSG91.

Run it:
```bash
npm run dev
```
Server starts on `http://localhost:5000`. Test it:
```bash
curl http://localhost:5000/api/health
```

**Seed sample products** (do this once, after the server can connect to MongoDB):
```bash
npm run seed
```
This wipes and recreates categories/products with 2 sample murtis (including
variants with different sizes, finishes, and stock levels — one variant is
intentionally set to 0 stock so you can see the "Out of Stock" UI).

To make yourself an admin (needed later for product CRUD), after logging in
once via OTP, manually update your user's `role` to `"admin"` in MongoDB
Atlas/Compass — there's no admin panel yet (that's a later phase).

## 2. Frontend setup

```bash
cd client
npm install
cp .env.local.example .env.local
npm run dev
```
Opens on `http://localhost:3000`. Go to `http://localhost:3000/login` to
test the OTP flow — since MSG91 isn't configured yet, check your **backend
terminal** for a line like `[DEV MODE] OTP for 9876543210: 482913` and type
that code into the frontend.

## 3. What's included in Phase 1

- `server/models/User.js` — matches the spec's DB schema (phone-based, no password)
- `server/models/Otp.js` — hashed OTP storage with automatic MongoDB TTL expiry
- `server/controllers/authController.js` — send-otp, verify-otp, `/me`, and a
  stubbed google-login endpoint ready for Phase 2
- `server/middleware/auth.js` — `protect` (JWT check) and `adminOnly` (role check)
- `server/middleware/rateLimiter.js` — OTP abuse prevention
- `client/app/login/page.jsx` — full OTP UI (send → verify → resend cooldown)
- `client/context/AuthContext.jsx` — global auth state, persists via localStorage token

## 3. What's included (Phase 1 + 2)

**Phase 1:**
- `server/models/User.js` — matches the spec's DB schema (phone-based, no password)
- `server/models/Otp.js` — hashed OTP storage with automatic MongoDB TTL expiry
- `server/controllers/authController.js` — send-otp, verify-otp, `/me`, and a
  stubbed google-login endpoint ready for a later phase
- `server/middleware/auth.js` — `protect` (JWT check) and `adminOnly` (role check)
- `server/middleware/rateLimiter.js` — OTP abuse prevention
- `client/app/login/page.jsx` — full OTP UI (send → verify → resend cooldown)
- `client/context/AuthContext.jsx` — global auth state, persists via localStorage token

**Phase 2:**
- `server/models/Category.js`, `server/models/Product.js` (with `variants[]`), `server/models/Cart.js`
- `server/middleware/cartOwner.js` — identifies cart owner from JWT or guest header
- `server/controllers/productController.js` — paginated/filterable listing + admin CRUD
- `server/controllers/cartController.js` — get/add/update/remove with stock validation
- `server/seed.js` — sample data for local testing
- `client/app/products/page.jsx` — SSR/ISR product listing
- `client/app/products/[slug]/page.jsx` — SSR/ISR product detail with SEO metadata + JSON-LD
- `client/components/AddToCartPanel.jsx` — variant selector + add-to-cart (client component)
- `client/app/cart/page.jsx` + `client/context/CartContext.jsx` — full cart UI

## 4. Not yet included (coming in later phases)

- Checkout, Razorpay payment, orders (Phase 3)
- Admin panel UI (Phase 4) — for now, add products directly via `seed.js` or MongoDB Compass
- Google Sign-In real implementation (stubbed — see comment in `authController.js`)
- Search/filter UI on the frontend (backend API already supports `category`, `deity`, `purpose`, `minPrice`, `maxPrice`, `search` query params — just needs a filter sidebar built)
- Wishlist, reviews

## 5. Next step

Once you've confirmed products load, variants can be selected, and items can
be added/updated/removed from the cart locally — come back and we'll build
**Phase 3: Checkout + Razorpay Payment + Orders**.

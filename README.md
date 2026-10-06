# Frontend Gromar Contract

Next.js 16 frontend for GROMAR E-Commerce & Smart Contract.

## 🐳 Docker Deployment & Containerization (Modul 4 - UTS)

### Docker Hub Repository
* **Repository:** `https://hub.docker.com/r/farizalfisaputra/gromar-frontend`
* **Tag Image:** `:v1-UTS` (contoh: `farizalfisaputra/gromar-frontend:v1-UTS`)

### Menjalankan dengan Docker Compose
Frontend dapat dijalankan secara terisolasi via Docker Compose:

```bash
# 1. Jalankan Frontend Container
docker compose up -d

# 2. Cek status container
docker compose ps

# 3. Akses frontend di browser
# http://localhost:3000

# 4. Matikan container
docker compose down
```

### Build & Push Manual ke Docker Hub
```bash
# Build image
docker compose build

# Tag image dengan username Docker Hub
docker tag gromar/frontend:v1-UTS farizalfisaputra/gromar-frontend:v1-UTS

# Push ke Docker Hub
docker push farizalfisaputra/gromar-frontend:v1-UTS
```

---

## 🏗️ Project Structure

```
Frontend-GromarContract/
├── app/                  # Next.js App Router pages and API routes
├── components/           # UI components (Header, Footer, Hero, Dashboard, Shop, UI)
├── docs/                 # Documentation assets and screenshots
│   └── screenshots/      # UI preview and design mockups
├── lib/                  # Utility functions, API clients, and stores
├── public/               # Static assets (images, icons, logos)
├── Dockerfile            # Multi-stage Docker build (pnpm + Next.js Standalone)
├── docker-compose.yml    # Service orchestration
└── README.md
```

---

## 🚀 Setup & Local Development

1. Salin `.env.local.example` ke `.env.local`.
2. Sesuaikan konfigurasi environment:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```
3. Install dependencies:
```bash
pnpm install
```
4. Jalankan development server:
```bash
pnpm dev
```
Aplikasi dapat diakses di `http://localhost:3000`.

---

## 🚀 Deploy to Vercel

1. Push kode terbaru ke GitHub.
2. Import repository di dashboard Vercel.
3. Konfigurasi environment variables (`NEXT_PUBLIC_API_URL`, dll).
4. Deploy.

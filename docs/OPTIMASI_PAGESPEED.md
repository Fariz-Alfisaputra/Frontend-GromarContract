# 🚀 Rencana Optimasi Performa & PageSpeed Insights
**Website:** `https://gromarcontract.com/`  
**Analisis Referensi:** [Google PageSpeed Insights Report](https://pagespeed.web.dev/analysis/https-gromarcontract-com/ejklo4ltye?form_factor=desktop)  
**Tanggal:** 21 September 2026  

---

## 1. 📊 Status Metrik Saat Ini vs Target

| Metrik | Saat Ini (Desktop) | Saat Ini (Mobile) | Target Pasca Optimasi | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Performance Score** | **78** / 100 | **67** / 100 | **95+** / 100 | ⚠️ Butuh Optimasi |
| **Accessibility Score** | **96** / 100 | **96** / 100 | **96 - 100** | ✅ Sangat Baik |
| **Best Practices Score** | **100** / 100 | **100** / 100 | **100** | ✅ Sempurna |
| **SEO Score** | **100** / 100 | **100** / 100 | **100** | ✅ Sempurna |
| **First Contentful Paint (FCP)** | 0.4 s | 1.5 s | **< 0.8 s** | 🟡 Perlu percepatan di Mobile |
| **Largest Contentful Paint (LCP)** | 2.7 s | 15.2 s | **< 1.8 s** | 🔴 Kritis di Mobile & Desktop |
| **Total Blocking Time (TBT)** | 50 ms | 10 ms | **< 50 ms** | 🟢 Sudah Sangat Baik |
| **Cumulative Layout Shift (CLS)** | 0.002 | 0.014 | **< 0.05** | 🟢 Sangat Stabil |
| **Total Transfer Payload** | ~2.94 MB | ~2.94 MB | **< 600 KB** | 🔴 Terlalu Berat (Aset Gambar) |

---

## 2. 🔍 Diagnostik & Akar Masalah Utama

### A. Komponen `LoadingScreen` Menahan LCP (Kritis ⚠️)
* **Lokasi:** `components/loading-screen.tsx`
* **Masalah:**
  Komponen ini memiliki timer buatan:
  ```ts
  const fade = setTimeout(() => setHidden(true), 2100)
  const remove = setTimeout(() => setMounted(false), 2800)
  ```
  Selama 2.1 hingga 2.8 detik, overlay opaque `fixed inset-0 z-[100] bg-background` menutupi seluruh layar.
* **Dampak:**
  Mesin pengujian Google Lighthouse (terutama profil Mobile dengan CPU 4x throttling) mendeteksi bahwa elemen halaman utama tidak terlihat sama sekali selama durasi tersebut, sehingga skor LCP meledak ke **15.2 detik**.

### B. Gambar Hero Menggunakan Inline CSS `backgroundImage` (Kritis ⚠️)
* **Lokasi:** `components/hero.tsx` (baris 39)
* **Masalah:**
  ```tsx
  <div
    className="h-full w-full bg-cover bg-center"
    style={{ backgroundImage: 'url(/coastline.png)' }}
  />
  ```
* **Dampak:**
  1. Background image melalui CSS tidak dapat dioptimasi secara otomatis oleh Next.js Image Optimizer (tidak dikonversi ke WebP/AVIF, tidak ada responsive `srcset`).
  2. Browser tidak melakukan preloading otomatis, sehingga download gambar baru dimulai setelah CSS selesai dievaluasi.
  3. Ukuran file `coastline.png` mentah mencapai **530 KB**.

### C. Aset Gambar di `public/` Belum Terkompresi (~2.25 MB Potensi Penghematan)
* **Lokasi:** Folder `public/`
* **Temuan Ukuran File:**
  * `coastline.png`: **530 KB**
  * `agriculture.png`: **486 KB**
  * `marine.png`: **442 KB**
  * `agri-rice.png`: **293 KB**
  * `marine-fish.png`: **240 KB**
  * `agri-coffee.png`: **230 KB**
  * `agri-vegetables.png`: **228 KB**
  * `agri-ingredients.png`: **210 KB**
  * `marine-seaweed.png`: **198 KB**
  * `marine-shrimp.png`: **198 KB**
  * `marine-crab.png`: **188 KB**
* **Dampak:** Total transfer gambar pada initial load mencapai ~3 MB. Jika dikonversi ke WebP berkualitas tinggi (q=80), ukuran dapat dipangkas **75% - 85%** menjadi total ~400 KB saja.

### D. Initial Bundle Memuat Komponen Interaktif Non-Critical
* **Lokasi:** `app/layout.tsx`
* **Masalah:**
  `ChatWidget` dan `CartDrawer` diimpor secara statis dan dieksekusi langsung pada initial paint, meskipun pengguna belum tentu langsung membuka chat atau keranjang saat landing page pertama kali dibuka.

### E. Konfigurasi `next.config.mjs` Belum Mengaktifkan Format Modern
* **Lokasi:** `next.config.mjs`
* **Masalah:**
  Belum ada instruksi `formats: ['image/avif', 'image/webp']` dan `optimizePackageImports` untuk package besar seperti `lucide-react` dan `framer-motion`.

---

## 3. 🛠️ Daftar Berkas yang Harus Diubah & Dibuat

| Status | Lokasi File | Deskripsi Perubahan |
| :---: | :--- | :--- |
| **[MODIFY]** | `Frontend-GromarContract/components/loading-screen.tsx` | Menghilangkan blocking LCP; hanya aktif sekali via session/instan atau diubah menjadi non-blocking progress indicator. |
| **[MODIFY]** | `Frontend-GromarContract/components/hero.tsx` | Mengganti `style={{ backgroundImage }}` dengan `<Image priority sizes="100vw" fill quality={80} ... />`. |
| **[MODIFY]** | `Frontend-GromarContract/next.config.mjs` | Menambahkan format `image/avif`, `image/webp`, `compress: true`, dan `optimizePackageImports`. |
| **[MODIFY]** | `Frontend-GromarContract/app/layout.tsx` | Menggunakan `next/dynamic` dengan `{ ssr: false }` untuk `ChatWidget` dan `CartDrawer`. |
| **[MODIFY]** | `Frontend-GromarContract/components/industries.tsx` | Memperbarui referensi gambar ke WebP dan memastikan atribut `sizes` dan `loading="lazy"` terpasang. |
| **[MODIFY]** | `Frontend-GromarContract/app/shop/page.tsx` | Memperbarui referensi gambar kategori ke WebP. |
| **[NEW]** | `Frontend-GromarContract/public/*.webp` | Hasil kompresi WebP dari semua file PNG berukuran besar di folder `public/`. |

---

## 4. 📝 Rincian Perubahan Kode (Sebelum vs Sesudah)

### 1. `components/loading-screen.tsx`
#### Sebelum:
```tsx
useEffect(() => {
  const rotate = setInterval(...)
  const fade = setTimeout(() => setHidden(true), 2100)
  const remove = setTimeout(() => setMounted(false), 2800)
  ...
}, [])

if (!mounted) return null

return (
  <div className={`fixed inset-0 z-[100] ... ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
    {/* Menghalangi LCP selama 2.8 detik */}
  </div>
)
```
#### Solusi / Sesudah:
* Menggunakan `sessionStorage` agar hanya muncul sekali saat sesi pertama, atau menghapus full opaque overlay sehingga halaman di belakangnya langsung ter-render (menghilangkan 2.1 detik blocking LCP).

---

### 2. `components/hero.tsx`
#### Sebelum:
```tsx
<motion.div
  className="absolute inset-0 -z-20 origin-center"
  style={{ y: bgY, scale: bgScale }}
>
  <div
    className="h-full w-full bg-cover bg-center"
    style={{ backgroundImage: 'url(/coastline.png)' }}
  />
</motion.div>
```
#### Sesudah:
```tsx
import Image from 'next/image'

// ...
<motion.div
  className="absolute inset-0 -z-20 origin-center"
  style={{ y: bgY, scale: bgScale }}
>
  <Image
    src="/coastline.webp"
    alt="Coastline Indonesian Landscape"
    fill
    priority
    quality={80}
    sizes="100vw"
    className="h-full w-full object-cover"
  />
</motion.div>
```
* **Keuntungan:** Next.js akan menyisipkan `<link rel="preload" as="image">` di `<head>`, menghasilkan format AVIF/WebP secara on-the-fly, dan memangkas LCP drastis.

---

### 3. `next.config.mjs`
#### Tambahkan Konfigurasi Optimasi:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 hari cache
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost', port: '5000' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1', port: '5000' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

export default nextConfig
```

---

### 4. `app/layout.tsx`
#### Dynamic Import Widget Non-Kritis:
```tsx
import dynamic from 'next/dynamic'

// Lazy load komponen interaktif agar tidak membebani initial paint
const ChatWidget = dynamic(
  () => import('@/components/chat-widget').then((m) => m.ChatWidget),
  { ssr: false }
)
const CartDrawer = dynamic(
  () => import('@/components/shop/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
)
```

---

### 5. Kompresi Gambar `public/` ke WebP
Menggunakan pustaka `sharp` (sudah ada di node_modules) untuk mengonversi gambar PNG besar ke WebP dengan kualitas 80:
* `coastline.png` (530 KB) ➡️ `coastline.webp` (~70 KB)
* `agriculture.png` (486 KB) ➡️ `agriculture.webp` (~65 KB)
* `marine.png` (442 KB) ➡️ `marine.webp` (~60 KB)
* `agri-rice.png` (293 KB) ➡️ `agri-rice.webp` (~40 KB)
* `marine-fish.png` (240 KB) ➡️ `marine-fish.webp` (~35 KB)
* `agri-coffee.png` (230 KB) ➡️ `agri-coffee.webp` (~35 KB)
* `agri-vegetables.png` (228 KB) ➡️ `agri-vegetables.webp` (~35 KB)
* `agri-ingredients.png` (210 KB) ➡️ `agri-ingredients.webp` (~32 KB)
* `marine-seaweed.png` (198 KB) ➡️ `marine-seaweed.webp` (~30 KB)
* `marine-shrimp.png` (198 KB) ➡️ `marine-shrimp.webp` (~30 KB)
* `marine-crab.png` (188 KB) ➡️ `marine-crab.webp` (~28 KB)

---

## 5. 🎯 Estimasi Dampak Setelah Optimasi

1. **Largest Contentful Paint (LCP):**
   * Turun dari **2.7 s (Desktop)** menjadi **< 1.0 s**
   * Turun dari **15.2 s (Mobile)** menjadi **< 2.0 s**
2. **Total Ukuran Download:**
   * Berkurang dari **~2.94 MB** menjadi **< 600 KB** (penghematan > 80%)
3. **Skor PageSpeed Insights:**
   * **Desktop:** Diproyeksikan naik dari **78** ke **96 – 99**
   * **Mobile:** Diproyeksikan naik dari **67** ke **92 – 97**

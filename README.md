# MetaGames

Tugas Mata Kuliah **Web Application Development**

Aplikasi web dengan arsitektur terpisah antara frontend dan backend, di-deploy pada dua environment: production dan development.

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Environment](#environment)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi & Menjalankan Secara Lokal](#instalasi--menjalankan-secara-lokal)
- [Environment Variables](#environment-variables)

## Tentang Proyek

> Tulis deskripsi singkat proyek di sini: tujuan aplikasi, fitur utama, dan latar belakang tugas.

## Environment

| Environment | Frontend | Backend (API) |
|---|---|---|
| **Production** | [metagames.my.id](https://metagames.my.id) | [api.metagames.my.id](https://api.metagames.my.id) |
| **Development** | [dev.metagames.my.id](https://dev.metagames.my.id) | [api-dev.metagames.my.id](https://api-dev.metagames.my.id) |

## Tech Stack

**Frontend**
- Framework: `React + Vite`
- Styling: `Tailwind CSS`

**Backend**
- Framework/Runtime: `Hono JS`
- Database: `...`
- API Documentation: `Scalar`

## Struktur Proyek

```
.
├── frontend/       # Kode sumber frontend
├── backend/        # Kode sumber backend (API)
└── README.md
```

## Instalasi & Menjalankan Secara Lokal

### Prasyarat

- Node.js `>= 18`
- npm / yarn / pnpm

### Clone Repository

```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend akan berjalan di `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

## Environment Variables

Buat file `.env` pada masing-masing folder (`frontend` dan `backend`) berdasarkan `.env.example`.

**Backend (`backend/.env`)**
```env
PORT=
DATABASE_URL=
JWT_SECRET=
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:<port>
```

---

Dibuat untuk memenuhi tugas mata kuliah **Web Application Development**.

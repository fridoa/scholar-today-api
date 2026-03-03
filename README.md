# Scholar Today API

Backend API untuk aplikasi Scholar Today — sistem autentikasi dengan proxy ke JSONPlaceholder API.

> 🌐 **Base URL (Production):** [https://scholar-today-api.vercel.app/api/v1](https://scholar-today-api.vercel.app/api/v1)
>
> 📖 **Dokumentasi API:** [https://scholar-today-api.vercel.app/api-docs](https://scholar-today-api.vercel.app/api-docs)

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js v5
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + bcrypt
- **Validation**: Yup

## Fitur

- 🔐 **Register** — Mendaftarkan user dengan validasi email ke JSONPlaceholder
- 🔑 **Login** — Autentikasi user dan generate JWT
- 👤 **Profile** — Mengambil profil user dari JSONPlaceholder berdasarkan email
- 📝 **Posts Proxy** — Proxy endpoint untuk mengambil data posts
- 💬 **Comments Proxy** — Proxy endpoint untuk komentar pada postingan
- 👥 **Users Proxy** — Proxy endpoint untuk data user
- 📸 **Albums & Photos Proxy** — Proxy endpoint untuk album dan foto
- ✅ **Todos Proxy** — Proxy endpoint untuk daftar tugas

## Instalasi

```bash
# Clone repository
git clone https://github.com/username/scholar-today-api.git

# Install dependencies
npm install
```

## Konfigurasi Environment

Buat file `.env` di root project:

```env
PORT=8000
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
JWT_SECRET_KEY=your_jwt_secret_key
JWT_EXPIRES_IN=1d
JSON_PLACEHOLDER_URL=https://jsonplaceholder.typicode.com
```

## Menjalankan Server

```bash
# Development
npm run dev
```

Server berjalan di `http://localhost:8000`

## API Endpoints

Base URL: `/api/v1`


## Flow Autentikasi

1. **Register** → Email dicek ke JSONPlaceholder (hanya email valid yang bisa daftar) → Password di-hash dengan bcrypt → Disimpan ke MongoDB
2. **Login** → Validasi email & password → Generate JWT token
3. **Akses Protected Route** → JWT diverifikasi via middleware `authorization` → Request dilanjutkan ke handler

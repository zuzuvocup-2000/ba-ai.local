# BA AI Local Setup (No Docker)

## Stack

- Backend: Laravel 13 (PHP 8.3)
- Frontend: React + Vite
- Main database: PostgreSQL
- Log database: MongoDB
- Local web server: OpenServer (`ba-ai.local`)

## Requirements

- PHP 8.3+
- Composer
- Node.js 20+
- PostgreSQL (running on `127.0.0.1:5432`)
- MongoDB (running on `127.0.0.1:27017`)

## 1) Configure hosts

Add this to your hosts file:

```txt
127.0.0.1 ba-ai.local
```

## 2) Setup backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

Default DB values in `.env.example` are:

- `DB_HOST=127.0.0.1`
- `DB_PORT=5432`
- `DB_DATABASE=ba_ai`
- `DB_USERNAME=ba_ai_user`
- `DB_PASSWORD=ba_ai_pass`
- `MONGODB_URI=mongodb://127.0.0.1:27017/ba_ai_data`

Adjust these values in `backend/.env` if your local services use different credentials.

CORS defaults for frontend are configured via:

- `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://ba-ai.local`

## 3) Setup frontend

```bash
cd frontend
npm install
```

## 4) Run development

Start frontend:

```bash
cd frontend
npm run dev
```

Backend can run through OpenServer using `.osp/project.ini` (`/backend/public` as web root), or directly with:

```bash
cd backend
php artisan serve
```

## Access

- OpenServer domain: [http://ba-ai.local](http://ba-ai.local)
- Frontend dev server: [http://localhost:5173](http://localhost:5173)

## Admin login (seed default)

- Email: `admin@ba-ai.local`
- Password: `Admin@123`

## API versioning

- Base API path: `http://ba-ai.local/api/v1`

## Engineering checklists

- Backend/Frontend prompt checklist: `docs/ai-code-checklists.md`

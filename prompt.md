# Build a full-stack Library Book Tracker web application using Next.js (frontend) and Django REST Framework (backend) with PostgreSQL as the database. The entire application must be containerized using Docker with proper multi-stage builds and Docker Compose

---

## PROJECT OVERVIEW

A library management system where:

- Students can browse books and borrow them
- The system automatically calculates fines for overdue books (₹5/day after due date)
- Librarian can add books, see who borrowed what, mark books as returned
- Everyone can see the fine. Prominently. With no mercy.

---

## TECH STACK

- Frontend: Next.js 14 (App Router), Tailwind CSS
- Backend: Django 4.2 + Django REST Framework
- Database: PostgreSQL 15
- Containerization: Docker + Docker Compose

---

## DJANGO BACKEND

### Models

Book:

- id, title, author, isbn, total_copies, available_copies, added_at

BorrowRecord:

- id, book (FK), student_name, student_roll_no, borrowed_date, due_date (borrowed_date + 14 days), returned_date (nullable), is_returned (default False)
- Property: fine_amount → if not returned and today > due_date → (today - due_date).days * 5 else 0

### API Endpoints (Django REST Framework)

GET    /api/books/              → list all books with available_copies
POST   /api/books/              → add a new book (librarian)
GET    /api/books/<id>/         → single book detail

POST   /api/borrow/             → borrow a book (provide book_id, student_name, student_roll_no). Decrements available_copies. Returns 400 if available_copies is 0.
GET    /api/borrow/             → list all borrow records with fine_amount included in response
POST   /api/borrow/<id>/return/ → mark as returned. Sets returned_date=today, is_returned=True, increments available_copies.

GET    /api/fines/              → list only records where is_returned=False and due_date < today, ordered by fine_amount descending. This is the Wall of Shame.

### Seed Data

Create a management command `seed_data` that populates:

- 10 books (mix of CS classics and random books)
- 6 borrow records: 2 returned cleanly, 2 overdue with fines, 2 currently borrowed but not yet due
Use hardcoded past dates so fines are already calculated on first run.

---

## NEXT.JS FRONTEND

### Pages

/ (Home) → Book list. Each book card shows title, author, available copies as a badge (green if >0, red if 0). A "Borrow" button opens a small form (student name + roll number). Disabled if no copies available. On submit, calls POST /api/borrow/.

/returns → Table of all borrow records. Columns: Book, Student, Roll No, Borrowed Date, Due Date, Status (Returned / Overdue / Active), Fine (₹ amount in red if >0). A "Mark Returned" button on active/overdue rows.

/fines → The Wall of Shame. Large heading: "Wall of Shame". Lists all overdue unreturned borrows, sorted by fine amount descending. Show student name, roll number, book title, days overdue, fine in large red text. Add a small disclaimer at the bottom: "Fines accumulate at ₹5/day. We don't negotiate."

### API calls

Use fetch() pointing to NEXT_PUBLIC_API_URL environment variable (e.g. <http://backend:8000> inside Docker, <http://localhost:8000> for local dev without Docker).

---

## DOCKER SETUP — THIS IS THE MOST IMPORTANT PART

### frontend/Dockerfile (MUST be multi-stage, 3 stages)

Stage 1 (deps): node:20-alpine, copy package.json + package-lock.json, run npm ci
Stage 2 (builder): copy from deps, copy source, set NEXT_TELEMETRY_DISABLED=1, run npm run build
Stage 3 (runner): fresh node:20-alpine, NODE_ENV=production, copy only .next/standalone, .next/static, public from builder. CMD ["node", "server.js"]

Add to next.config.js: output: 'standalone'

### backend/Dockerfile

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1, PYTHONUNBUFFERED=1
COPY requirements.txt first, then pip install --no-cache-dir, then COPY . .
CMD: gunicorn myproject.wsgi:application --bind 0.0.0.0:8000

### frontend/.dockerignore

node_modules, .next, .env*, .git, README.md, **/*.test.*

### backend/.dockerignore

__pycache__, *.pyc, .env*, venv/, .git, tests/

### docker-compose.yml

Services:

db:
  image: postgres:15-alpine
  environment: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD from .env
  volumes: pgdata:/var/lib/postgresql/data
  NO ports exposed externally

backend:
  build: ./backend
  ports: "8000:8000"
  environment:
    DATABASE_URL: postgres://appuser:${DB_PASSWORD}@db:5432/myapp
    DJANGO_SECRET_KEY: ${DJANGO_SECRET_KEY}
    DEBUG: "False"
    ALLOWED_HOSTS: "*"
  depends_on: [db]

frontend:
  build: ./frontend
  ports: "3000:3000"
  environment:
    NEXT_PUBLIC_API_URL: <http://backend:8000>
  depends_on: [backend]

volumes:
  pgdata:

### .env.example (commit this to git)

DB_PASSWORD=changeme
DJANGO_SECRET_KEY=generate-a-real-one
DEBUG=False

### .env (do NOT commit, add to .gitignore)

DB_PASSWORD=librarysecret123
DJANGO_SECRET_KEY=django-insecure-dev-key-change-in-prod
DEBUG=False

---

## README.md

Include exactly these steps and nothing else:

```bash
git clone <repo>
cp .env.example .env
docker compose up --build -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_data

```

Open <http://localhost:3000>

---

## IMPORTANT CONSTRAINTS

1. The Django CORS settings must allow requests from <http://localhost:3000> and <http://frontend:3000>. Install django-cors-headers.
2. The fine_amount field must be included in the BorrowRecord serializer as a read-only computed field.
3. Do not expose the db service ports in docker-compose.yml. Only backend and frontend get port mappings.
4. The Next.js config must have output: 'standalone' — without this the multi-stage Docker build will not work.
5. Do not use localhost inside docker-compose.yml environment variables. Use service names (db, backend).
6. The seed data must use hardcoded dates in the past (e.g. borrowed 30 days ago, due 16 days ago) so fines are non-zero on first run without any manual setup.

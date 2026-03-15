```bash
git clone <repo>
cp .env.example .env
docker compose up --build -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_data
```

Open http://localhost:3000

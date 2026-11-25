FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 APP_ENV=production
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY docs/ ./docs/
ENV DATABASE_PATH=/app/data/maternacare.db
RUN mkdir -p /app/data
WORKDIR /app/backend
EXPOSE 10000
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","10000"]

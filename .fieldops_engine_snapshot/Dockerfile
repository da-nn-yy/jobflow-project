FROM python:3.11.9-slim-bookworm

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    FIELDOPS_AUTH_DISABLED=1 \
    FIELDOPS_CONFIG=/app/config/default.yaml

COPY . /app

RUN pip install --no-cache-dir .

EXPOSE 4200

RUN useradd --create-home --uid 10001 appuser
USER appuser

CMD ["uvicorn", "fieldops.api.app:create_app", "--factory", "--host", "0.0.0.0", "--port", "4200"]

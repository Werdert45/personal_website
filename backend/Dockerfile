FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (including GDAL for geospatial)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL environment variables for Linux
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgeos_c.so

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files. collectstatic runs at BUILD time, where no runtime env
# vars exist, so provide throwaway build-only values: DJANGO_DEBUG=True skips the
# production SECRET_KEY guard in settings.py (collectstatic needs neither a real
# secret nor the DB). The real DJANGO_SECRET_KEY/DJANGO_DEBUG=False are injected
# at RUNTIME by docker-compose, where the guard is enforced. Nothing here persists
# into the image (the env vars are scoped to this single RUN).
RUN DJANGO_DEBUG=True DJANGO_SECRET_KEY=build-only-not-used-at-runtime \
    python manage.py collectstatic --noinput

EXPOSE 8001

CMD ["gunicorn", "--bind", "0.0.0.0:8001", "config.wsgi:application"]

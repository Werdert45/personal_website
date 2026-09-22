#!/bin/sh
set -e

python manage.py migrate

if [ "$SEED_DEMO_DATA" = "true" ]; then
  python manage.py seed_data --demo
fi

python manage.py seed_chat_kb || echo 'seed_chat_kb failed - chat KB unavailable'
python manage.py seed_beta_content || echo 'seed_beta_content failed - beta content not seeded'

exec gunicorn --bind 0.0.0.0:8001 config.wsgi:application

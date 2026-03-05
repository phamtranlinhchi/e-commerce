#!/bin/sh
set -e

# Run Prisma migrations if migration files exist
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
fi

# Start the Next.js server
exec node server.js

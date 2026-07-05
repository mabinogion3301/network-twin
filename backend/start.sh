#!/bin/sh
set -e

echo "==> Limpando conexões com tipos de enum antigos..."
npx prisma db execute --url="$DATABASE_URL" --stdin << 'SQL'
TRUNCATE TABLE "Connection";
SQL

echo "==> Sincronizando schema..."
npx prisma db push --accept-data-loss

echo "==> Rodando seed..."
node prisma/seed.js

echo "==> Iniciando API..."
exec node dist/src/main
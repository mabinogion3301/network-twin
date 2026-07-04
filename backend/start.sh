#!/bin/sh
set -e

echo "==> Limpando conexões com tipos antigos..."
npx prisma db execute --url="$DATABASE_URL" --stdin << 'SQL'
DELETE FROM "Connection" WHERE type IN ('FIBER','CABLE','RADIO','WIRELESS','TOLETO_FIBER');
SQL

echo "==> Sincronizando schema..."
npx prisma db push --accept-data-loss

echo "==> Rodando seed..."
node prisma/seed.js

echo "==> Iniciando API..."
exec node dist/src/main
#!/bin/sh
set -e

echo "==> Sincronizando schema..."
npx prisma db push --accept-data-loss

echo "==> Rodando seed..."
node prisma/seed.js

echo "==> Iniciando API..."
exec node dist/src/main

#!/bin/sh
set -e

echo "==> Limpando conexões com tipos de enum antigos..."
# Apaga TODAS as conexões antes de alterar o enum — mais simples e seguro
# do que filtrar por tipo, pois o Postgres rejeita valores de enum inválidos
# mesmo em cláusulas WHERE durante a migração.
npx prisma db execute --url="$DATABASE_URL" --stdin << 'SQL'
TRUNCATE TABLE "Connection";
SQL

echo "==> Sincronizando schema..."
npx prisma db push --accept-data-loss

echo "==> Rodando seed..."
node prisma/seed.js

echo "==> Iniciando API..."
exec node dist/src/main

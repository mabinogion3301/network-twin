#!/bin/sh
set -e

echo "==> Limpando conexões com tipos de enum antigos..."
# Remove conexões que usam tipos que serão descontinuados.
# Seguro em produção porque estamos migrando os tipos de conexão --
# conexões com tipos antigos precisariam ser recadastradas de qualquer forma.
npx prisma db execute --url="$DATABASE_URL" --stdin << 'SQL'
DELETE FROM "Connection" WHERE type IN ('FIBER','CABLE','RADIO','WIRELESS','TOLETO_FIBER');
SQL

echo "==> Sincronizando schema com o banco..."
npx prisma db push --accept-data-loss

echo "==> Rodando seed..."
node prisma/seed.js

echo "==> Iniciando API..."
exec node dist/src/main

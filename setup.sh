#!/bin/bash
set -e

echo "==> Subindo PostgreSQL via Docker..."
docker compose up -d

echo "==> Instalando dependências do backend..."
cd backend
npm install

if [ ! -f .env ]; then
  echo "==> Criando arquivo .env..."
  cp .env.example .env
fi

echo "==> Aguardando o banco ficar disponível..."
sleep 5

echo "==> Rodando migrations..."
npx prisma migrate dev --name init

echo "==> Populando dados iniciais (seed)..."
npm run prisma:seed

echo "==> Tudo pronto! Iniciando a API..."
npm run start:dev

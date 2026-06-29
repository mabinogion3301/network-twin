@echo off
echo ==> Subindo PostgreSQL via Docker...
docker compose up -d
if %errorlevel% neq 0 (
  echo ERRO: Docker nao encontrado ou nao iniciado. Instale o Docker Desktop e abra-o antes de rodar este script.
  pause
  exit /b 1
)

cd backend

echo ==> Instalando dependencias do backend...
call npm install

if not exist .env (
  echo ==> Criando arquivo .env...
  copy .env.example .env
)

echo ==> Aguardando o banco ficar disponivel...
timeout /t 6 /nobreak >nul

echo ==> Rodando migrations...
call npx prisma migrate dev --name init

echo ==> Populando dados iniciais (seed)...
call npm run prisma:seed

echo ==> Tudo pronto! Iniciando a API...
call npm run start:dev

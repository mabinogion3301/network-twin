# Guia de Deploy — Network Twin na Nuvem

Este guia usa **Railway** para o backend + Postgres (mais simples e barato
pra começar — tem plano gratuito com limite mensal) e **Vercel** para o
frontend (gratuito para esse tipo de uso). Dá pra trocar por outras
plataformas (Render, Fly.io, AWS, etc) — a lógica é a mesma, só muda a
interface.

---

## 1. Backend + Banco de Dados (Railway)

### 1.1 Criar a conta e o projeto

1. Acesse https://railway.app e crie uma conta (pode usar GitHub login).
2. Clique em **"New Project"** → **"Provision PostgreSQL"** (isso já cria o
   banco pronto, com a `DATABASE_URL` configurada automaticamente).

### 1.2 Subir o código do backend

Você precisa do código em um repositório Git (GitHub é o mais simples).

```bash
cd network-twin
git init
git add .
git commit -m "Network Twin - deploy inicial"
```

Crie um repositório novo no GitHub e suba:
```bash
git remote add origin https://github.com/SEU_USUARIO/network-twin.git
git push -u origin main
```

No Railway: **"New"** → **"GitHub Repo"** → selecione o repositório →
configure o **Root Directory** como `backend` (já que o repo tem
backend/frontend juntos).

Railway detecta automaticamente o `Dockerfile` que já está em
`backend/Dockerfile` e usa ele para o build — não precisa configurar nada
de build manualmente.

### 1.3 Variáveis de ambiente no Railway

No painel do serviço backend, vá em **"Variables"** e adicione:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | (já vem preenchido automaticamente pelo Railway, pegando do Postgres provisionado — clique em "Add Reference" e selecione o Postgres) |
| `JWT_ACCESS_SECRET` | uma string aleatória longa, ex: gere com `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | outra string aleatória diferente da anterior |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | a URL do seu frontend (você vai pegar isso depois do passo 2 — pode deixar em branco por enquanto e voltar aqui) |
| `PORT` | `3000` (o Railway às vezes ignora e usa a porta dele automaticamente, sem problema) |

### 1.4 Popular o banco (seed)

Depois do primeiro deploy funcionar, abra o terminal do Railway
(botão "..." no serviço → "Shell", ou use a CLI do Railway local) e rode:

```bash
npm run prisma:seed
```

Isso cria o usuário admin (`admin@telebras.local` / `admin123`) e os tipos
de equipamento padrão.

**⚠️ IMPORTANTE: troque a senha do admin assim que conseguir acessar.**

### 1.5 Pegar a URL pública do backend

No painel do Railway, vá em **"Settings"** → **"Networking"** →
**"Generate Domain"**. Isso te dá uma URL pública tipo
`https://network-twin-backend.up.railway.app`.

---

## 2. Frontend (Vercel)

### 2.1 Deploy

1. Acesse https://vercel.com e crie conta (GitHub login também funciona).
2. **"Add New"** → **"Project"** → selecione o mesmo repositório do GitHub.
3. Em **"Root Directory"**, selecione `frontend`.
4. Vercel detecta automaticamente que é um projeto Vite — não precisa mudar
   build command nem output directory.

### 2.2 Variável de ambiente

Antes de clicar em "Deploy", expanda **"Environment Variables"** e adicione:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | a URL do backend que você pegou no passo 1.5 (ex: `https://network-twin-backend.up.railway.app`) |

Clique em **Deploy**.

### 2.3 Fechar o ciclo do CORS

Depois que a Vercel te der a URL do frontend (ex:
`https://network-twin.vercel.app`), volte no Railway e atualize a variável
`FRONTEND_URL` com essa URL — isso restringe o CORS da API para aceitar
requisições só do seu frontend.

---

## 3. Testando

1. Acesse a URL do frontend na Vercel.
2. Faça login com `admin@telebras.local` / `admin123` (e troque a senha!).
3. Teste cadastrar uma estação, simular uma falha, etc.

Se der erro de CORS ou de conexão, confira:
- `VITE_API_URL` no frontend está exatamente igual à URL pública do backend (sem barra no final)
- `FRONTEND_URL` no backend está exatamente igual à URL do frontend
- O WebSocket também depende de `VITE_API_URL` (usa a mesma variável)

---

## 4. Segurança antes de usar "de verdade"

Esta aplicação foi construída passo a passo numa conversa de desenvolvimento,
então alguns pontos merecem atenção antes de um uso real/produtivo:

- **Troque a senha do admin** imediatamente após o primeiro deploy.
- **Gere segredos JWT fortes e únicos** (não reutilize os de desenvolvimento).
- **HTTPS obrigatório** — Railway e Vercel já fornecem isso automaticamente.
- **Backup do banco**: Railway tem opção de backup automático do Postgres nos planos pagos — vale configurar se os dados forem importantes.
- **Revise os papéis (Roles)** cadastrados — por padrão só existem "Administrador" e "Operador".

---

## 5. Alternativas a este guia

- **Render** (https://render.com): muito parecido com Railway, também tem
  Postgres gerenciado e detecta Dockerfile automaticamente.
- **Fly.io**: mais controle de infraestrutura, requer um pouco mais de CLI.
- **AWS/GCP/Azure**: mais flexível e escalável, mas com curva de aprendizado
  maior — vale considerar se a Telebras já usa alguma dessas plataformas
  internamente.
- **Tudo em uma VM só** (DigitalOcean Droplet, EC2, etc): rode o
  `docker-compose.yml` que já existe na raiz do projeto (adicionando o
  backend como serviço também) numa VM com Docker instalado — mais barato
  para uso contínuo, mas exige você administrar a VM (atualizações de
  segurança, etc).

# Guia de Deploy — Network Twin na Nuvem (100% Gratuito)

Stack escolhida para ser **gratuita indefinidamente**, sem cartão de crédito
e sem risco de cobrança futura:

- **Neon** — banco PostgreSQL gratuito para sempre
- **Render** — backend (API NestJS) gratuito para sempre
- **Vercel** — frontend (React) gratuito para sempre

> ⚠️ Único trade-off do plano gratuito: o backend no Render "dorme" depois de
> 15 minutos sem uso, e demora ~30 segundos para "acordar" na próxima visita.
> Isso é normal e esperado — é o preço de ser gratuito sem prazo de validade.

---

## 1. Banco de Dados (Neon)

1. Acesse **https://neon.tech** e crie uma conta (pode usar login do GitHub).
2. Clique em **"Create a project"**.
3. Nome do projeto: `network-twin` (ou o que preferir).
4. Região: escolha a mais próxima do Brasil (ex: `US East` ou `South America` se disponível).
5. Depois de criado, vá na aba **"Connection string"** (ou "Dashboard" → "Connection Details").
6. Copie a string que começa com `postgresql://...` — essa é sua `DATABASE_URL`. Guarde ela, vai precisar no próximo passo.

---

## 2. Backend (Render)

### 2.1 Criar o Web Service

1. Acesse **https://render.com** e crie uma conta (pode usar login do GitHub).
2. Clique em **"New"** → **"Web Service"**.
3. Conecte sua conta do GitHub (se for a primeira vez, autorize o Render a acessar seus repositórios).
4. Selecione o repositório `network-twin`.
5. Configure:
   - **Name**: `network-twin-backend` (ou o que preferir)
   - **Root Directory**: `backend`
   - **Region**: a mais próxima disponível
   - **Branch**: `main`
   - **Runtime**: `Docker` (o Render deve detectar o `Dockerfile` automaticamente)
   - **Instance Type**: `Free`

### 2.2 Variáveis de ambiente

Antes de clicar em "Create Web Service", role até **"Environment Variables"**
e adicione:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | a string que você copiou do Neon no passo 1.6 |
| `JWT_ACCESS_SECRET` | uma string aleatória longa (pode gerar em https://generate-secret.vercel.app/32) |
| `JWT_REFRESH_SECRET` | outra string aleatória diferente da anterior |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | deixe em branco por enquanto — voltamos aqui depois do passo 3 |

Clique em **"Create Web Service"**. O primeiro deploy demora alguns minutos
(o Render vai construir a imagem Docker e rodar as migrations automaticamente).

### 2.3 Popular o banco (seed)

Depois que o deploy terminar com sucesso (status "Live"):

1. No painel do serviço, clique na aba **"Shell"**.
2. Rode:
   ```bash
   npm run prisma:seed
   ```

Isso cria o usuário admin (`admin@telebras.local` / `admin123`) e os tipos
de equipamento padrão.

**⚠️ Troque a senha do admin assim que conseguir acessar o sistema.**

### 2.4 Pegar a URL pública do backend

No topo do painel do serviço, copie a URL pública — algo como
`https://network-twin-backend.onrender.com`. Guarde, vai usar no próximo passo.

---

## 3. Frontend (Vercel)

1. Acesse **https://vercel.com** e crie conta (login do GitHub).
2. **"Add New"** → **"Project"** → selecione o repositório `network-twin`.
3. Em **"Root Directory"**, clique em "Edit" e selecione `frontend`.
4. Vercel detecta automaticamente que é Vite — não precisa mudar build command.
5. Expanda **"Environment Variables"** e adicione:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | a URL do backend do passo 2.4 (ex: `https://network-twin-backend.onrender.com`) — **sem barra no final** |

6. Clique em **"Deploy"**.

---

## 4. Fechar o ciclo do CORS

Depois que a Vercel terminar e te der a URL do frontend (ex:
`https://network-twin.vercel.app`):

1. Volte no **Render**, no seu serviço backend → **"Environment"**.
2. Edite a variável `FRONTEND_URL` e cole essa URL (sem barra no final).
3. Salve — o Render vai reiniciar o serviço automaticamente para aplicar.

---

## 5. Testando

1. Acesse a URL do frontend na Vercel.
2. **Na primeira visita, pode demorar ~30 segundos** para a página carregar
   (o backend estava "dormindo" e precisa "acordar"). Isso é normal no plano
   gratuito do Render.
3. Faça login com `admin@telebras.local` / `admin123` e **troque a senha**.
4. Teste cadastrar uma estação, simular uma falha, etc.

### Se der erro de CORS ou "Network Error"

- Confira se `VITE_API_URL` (Vercel) está EXATAMENTE igual à URL do Render, sem barra no final.
- Confira se `FRONTEND_URL` (Render) está EXATAMENTE igual à URL da Vercel, sem barra no final.
- Espere o backend "acordar" (primeira requisição depois de inatividade demora).

---

## 6. Segurança antes de usar "de verdade"

- **Troque a senha do admin** imediatamente.
- **Gere segredos JWT fortes e únicos** — não reutilize os de desenvolvimento.
- **HTTPS já vem automático** no Render e na Vercel.
- **Backup do banco**: o plano gratuito do Neon mantém o banco, mas vale
  exportar um backup manual periodicamente enquanto o uso for crítico
  (`pg_dump`, disponível na aba de conexão do Neon).

---

## 7. Quando "crescer" e precisar de mais

Se o uso da equipe aumentar e o "sono" do backend gratuito começar a
incomodar (ex: muitos usuários simultâneos esperando os 30s de boot), as
opções de upgrade, em ordem de custo:

- **Render** tem um plano pago "Starter" (~US$7/mês) que remove o "sono".
- **Neon** tem planos pagos com mais armazenamento/computação se o banco crescer muito.
- Nesse ponto, migrar para Railway ou uma VM dedicada também passa a fazer sentido.

Mas para uso interno, testes, e validação do sistema, o plano 100% gratuito
deve ser suficiente por um bom tempo.

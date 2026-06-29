# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY . .
RUN npm run build

# Runtime
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev
RUN npx prisma generate
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Roda as migrations pendentes e só então inicia a API — assim, todo deploy
# novo já garante que o banco está com o schema atualizado.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

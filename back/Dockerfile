# 1. Étape des dépendances
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2. Étape de construction / génération Prisma
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ⚠️ Assurez-vous d'avoir bien votre dossier prisma/ copié (inclus dans COPY . .)
RUN npx prisma generate

# 3. Étape de production finale
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Création d'un utilisateur non-privilégié pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
# 💡 (Optionnel mais recommandé si Prisma tourne en prod) Copiez aussi le dossier prisma si nécessaire au runtime
# COPY --from=builder /app/prisma ./prisma

USER nodeuser

# CORRECTION ICI : Le backend écoute sur le port 5000 (et non 3000)
EXPOSE 5000

CMD ["npm", "start"]
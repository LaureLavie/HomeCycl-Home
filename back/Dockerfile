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
# Si tu utilises Prisma, c'est ici qu'on génère le client
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

USER nodeuser

EXPOSE 4000

CMD ["npm", "start"]
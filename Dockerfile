# Étape 1 : Base
FROM node:20-alpine AS base
WORKDIR /app

# Étape 2 : Installation des dépendances
FROM base AS deps
COPY package*.json ./
RUN npm install

# Étape 3 : Application finale
FROM base AS runner
WORKDIR /app

# Copie uniquement les dépendances nécessaires
COPY --from=deps /app/node_modules ./node_modules
# Copie le reste du code source
COPY . .

# Génère le client Prisma 
RUN npx prisma generate

EXPOSE 3000

# Utilise le script "start" 
CMD ["npm", "start"]
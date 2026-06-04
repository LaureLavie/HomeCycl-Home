# Étape de build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compilation : transforme tout le dossier src/ en dist/
RUN npm install -g typescript && tsc

# Étape finale (exécution)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# On lance le code compilé
CMD ["node", "dist/index.ts"]
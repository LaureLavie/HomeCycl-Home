# DEV-04 : image Docker du frontend Next.js
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV PORT=3001
EXPOSE 3001
CMD ["npm", "start"]
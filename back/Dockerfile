FROM node:22-alpine AS base

WORKDIR /app


COPY package*.json ./
RUN npm install

COPY . .


CMD ["npx", "ts-node", "--esm", "src/index.ts"]
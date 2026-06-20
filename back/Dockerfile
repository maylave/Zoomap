# Production stage
FROM node:20-alpine

WORKDIR /app

# Создаем непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Копируем package файлы
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev для tsx)
RUN npm ci && npm cache clean --force

# Копируем исходный код
COPY . .

# Создаем директорию для uploads
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

# Переключаемся на непривилегированного пользователя
USER nodejs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запускаем через tsx (работает с ES modules)
CMD ["npx", "tsx", "src/index.ts"]
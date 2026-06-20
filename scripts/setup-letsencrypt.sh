#!/bin/bash

# Скрипт для настройки Let's Encrypt SSL сертификатов

DOMAIN=${1:-"yourdomain.com"}
EMAIL=${2:-"admin@yourdomain.com"}

echo "🔐 Настройка Let's Encrypt для домена: $DOMAIN"

# Создаем директорию для сертификатов
mkdir -p nginx/ssl

# Останавливаем nginx для первоначальной настройки
docker-compose -f docker-compose.prod.yml stop nginx

# Получаем первоначальный сертификат
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

# Запускаем nginx
docker-compose -f docker-compose.prod.yml start nginx

echo "✅ Let's Encrypt сертификат установлен для $DOMAIN"
echo ""
echo "📝 Сертификаты находятся в:"
echo "   - nginx/ssl/live/$DOMAIN/fullchain.pem"
echo "   - nginx/ssl/live/$DOMAIN/privkey.pem"
echo ""
echo "🔄 Certbot автоматически обновляет сертификаты каждые 12 часов"
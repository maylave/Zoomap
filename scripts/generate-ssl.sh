#!/bin/bash

# Скрипт для генерации самоподписанных SSL сертификатов для разработки

echo "🔐 Генерация самоподписанных SSL сертификатов..."


mkdir -p nginx/ssl


openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=ZooVerse/OU=Dev/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"


chmod 644 nginx/ssl/cert.pem
chmod 600 nginx/ssl/key.pem

echo "✅ SSL сертификаты созданы:"
echo "   - nginx/ssl/cert.pem"
echo "   - nginx/ssl/key.pem"
echo ""
echo "📝 Для использования в браузере:"
echo "   1. Откройте https://localhost"
echo "   2. Примите самоподписанный сертификат"
echo ""
echo "🔒 Для production используйте Let's Encrypt:"
echo "   docker-compose -f docker-compose.prod.yml run certbot certonly --webroot -w /var/www/certbot -d yourdomain.com"
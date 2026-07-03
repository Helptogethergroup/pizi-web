#!/bin/bash
# ============================================
# PIZI API — One-Command VPS Deployment
# ============================================
# Run on Ubuntu 22.04 VPS as root
# Usage: bash deploy.sh

set -e

echo "🚀 PIZI API Deployment Starting..."

# Update system
apt update && apt upgrade -y

# Install Node 20
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# Install required tools
apt install -y nginx mysql-server redis-server git certbot python3-certbot-nginx

# Install PM2 (npm comes with Node)
npm install -g pm2

# Secure MySQL
echo "🔒 Securing MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS pizi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'pizi_user'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON pizi_db.* TO 'pizi_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Clone or pull repo
if [ ! -d "/var/www/pizi-platform" ]; then
    cd /var/www
    git clone https://github.com/YOUR_USERNAME/pizi-platform.git
fi

cd /var/www/pizi-platform
git pull

# Install + build
npm ci
cd apps/api

# Copy env (must be created beforehand)
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Edit .env with production values, then re-run this script"
    exit 1
fi

npm run prisma:generate
npm run prisma:push
npm run build

# Start with PM2
pm2 delete pizi-api 2>/dev/null || true
pm2 start dist/main.js --name pizi-api
pm2 save
pm2 startup systemd -u root --hp /root

# Nginx config
cat > /etc/nginx/sites-available/api.pizi.in <<'EOF'
server {
    listen 80;
    server_name api.pizi.in;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/api.pizi.in /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL
echo "🔒 Setup SSL (run manually if domain DNS pointed):"
echo "   certbot --nginx -d api.pizi.in"

echo ""
echo "✅ Deployment complete!"
echo "📡 API running at: http://$(curl -s ifconfig.me):4000"
echo "🌐 Configure DNS: api.pizi.in → $(curl -s ifconfig.me)"
echo "🔒 Then run: certbot --nginx -d api.pizi.in"
echo ""
echo "Useful commands:"
echo "  pm2 logs pizi-api    # View logs"
echo "  pm2 restart pizi-api # Restart"
echo "  pm2 monit            # Monitor"

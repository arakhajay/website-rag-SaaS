#!/bin/bash
# Install Certbot and obtain/renew Let's Encrypt SSL certificate
# Runs after each deployment on EB SingleInstance

DOMAIN="www.zivoxagent.com"
DOMAIN2="zivoxagent.com"
EMAIL="arakhajay@gmail.com"
WEBROOT="/var/www/certbot"
HTTPS_CONF="/etc/nginx/conf.d/https.conf"

# Create webroot directory
mkdir -p "$WEBROOT"

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "[Certbot] Installing certbot..."
    dnf install -y python3-pip 2>/dev/null || yum install -y python3-pip 2>/dev/null
    pip3 install certbot
fi

# Obtain or renew certificate
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "[Certbot] Certificate exists, renewing..."
    certbot renew --non-interactive --webroot -w "$WEBROOT" 2>&1 || true
else
    echo "[Certbot] Obtaining new certificate..."
    certbot certonly \
        --webroot \
        -w "$WEBROOT" \
        -d "$DOMAIN" \
        -d "$DOMAIN2" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        2>&1 || { echo "[Certbot] Failed"; exit 0; }
fi

# If cert exists, configure HTTPS + redirect
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "[Certbot] Writing HTTPS nginx config..."
    cat > "$HTTPS_CONF" << 'EOF'
# HTTPS server block - managed by certbot hook
server {
    listen 443 ssl;
    server_name www.zivoxagent.com zivoxagent.com;

    ssl_certificate /etc/letsencrypt/live/www.zivoxagent.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.zivoxagent.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 200M;

    location / {
        proxy_pass          http://127.0.0.1:8080;
        proxy_http_version  1.1;
        proxy_set_header    Connection          $connection_upgrade;
        proxy_set_header    Upgrade             $http_upgrade;
        proxy_set_header    Host                $host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto   https;
        proxy_set_header    X-Forwarded-Host    $host;

        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
        proxy_busy_buffers_size 32k;

        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name www.zivoxagent.com zivoxagent.com;

    # Certbot challenges must stay on HTTP
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
EOF

    nginx -t && systemctl reload nginx
    echo "[Certbot] HTTPS configured!"
else
    echo "[Certbot] No certificate, HTTP only"
fi

# Setup auto-renewal cron
if ! crontab -l 2>/dev/null | grep -q certbot; then
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --webroot -w /var/www/certbot && systemctl reload nginx") | crontab -
    echo "[Certbot] Auto-renewal cron set"
fi

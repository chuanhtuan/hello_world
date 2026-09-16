#!/bin/bash
set -euxo pipefail

# --- Base packages ---
dnf update -y || yum update -y
dnf install -y git nginx || yum install -y git nginx

# --- Node.js 20 LTS ---
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs || yum install -y nodejs

npm install -g pm2

# --- App user & directory ---
id -u appuser &>/dev/null || useradd -m -s /bin/bash appuser
mkdir -p /opt/hello_world
chown appuser:appuser /opt/hello_world

# --- Clone the repo (first boot only; subsequent deploys use scripts/deploy.sh) ---
if [ ! -d /opt/hello_world/.git ]; then
  sudo -u appuser git clone "${github_repo_ssh_url}" /opt/hello_world || \
    echo "Clone failed - clone manually with deploy keys, then re-run scripts/deploy.sh"
fi

# --- Backend env file (fill in secrets after first boot!) ---
cat > /opt/hello_world/backend/.env <<EOF
NODE_ENV=production
PORT=4000
CLIENT_URL=https://${domain_name}
DB_HOST=${db_host}
DB_PORT=3306
DB_NAME=${db_name}
DB_USER=${db_username}
DB_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=7d
COOKIE_NAME=hw_token
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM="HelloWorld <no-reply@helloworld.com>"
AWS_REGION=${aws_region}
S3_BUCKET_NAME=${s3_bucket_name}
EOF
chown appuser:appuser /opt/hello_world/backend/.env
chmod 600 /opt/hello_world/backend/.env

# --- nginx reverse proxy: / -> frontend static build, /api -> backend:4000 ---
cat > /etc/nginx/conf.d/hello_world.conf <<'EOF'
server {
    listen 80;
    server_name _;

    root /opt/hello_world/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
EOF
systemctl enable nginx
systemctl restart nginx

echo "Bootstrap complete. Run scripts/deploy.sh from your machine (or CI) to build and start the app with pm2."

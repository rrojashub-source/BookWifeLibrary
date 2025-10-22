#!/bin/bash

# Script de Deployment para Biblioteca Moi en Hostinger VPS
# Ubuntu 24.04

set -e

echo "🚀 Iniciando deployment de Biblioteca Moi..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
APP_NAME="biblioteca-moi"
APP_DIR="/var/www/$APP_NAME"
DB_NAME="biblioteca_moi"
DB_USER="biblioteca_user"
DOMAIN="bibliotecamoi.com"  # Cambia esto por tu dominio

echo -e "${BLUE}📦 Paso 1: Actualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${BLUE}📦 Paso 2: Instalando Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
node -v
npm -v

echo -e "${BLUE}🐘 Paso 3: Instalando PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
fi

echo -e "${BLUE}🗄️ Paso 4: Configurando base de datos...${NC}"
# Generar contraseña aleatoria para la BD
DB_PASSWORD=$(openssl rand -base64 32)

# Crear usuario y base de datos
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF

echo -e "${GREEN}✅ Base de datos creada${NC}"

echo -e "${BLUE}📂 Paso 5: Creando directorio de aplicación...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

echo -e "${BLUE}📥 Paso 6: Clonando código...${NC}"
echo "Ahora debes subir tu código aquí: $APP_DIR"
echo "Puedes usar git clone o FileZilla para subir los archivos"
echo ""
echo "Si usas git:"
echo "  cd $APP_DIR"
echo "  git clone https://github.com/tu-usuario/biblioteca-moi.git ."
echo ""
read -p "Presiona Enter cuando hayas subido el código..."

echo -e "${BLUE}📦 Paso 7: Instalando dependencias...${NC}"
cd $APP_DIR
npm install

echo -e "${BLUE}⚙️ Paso 8: Configurando variables de entorno...${NC}"
# Generar SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 32)

cat > .env <<EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
PGHOST=localhost
PGPORT=5432
PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD
PGDATABASE=$DB_NAME
SESSION_SECRET=$SESSION_SECRET
NODE_ENV=production
PORT=5000
EOF

echo -e "${GREEN}✅ Archivo .env creado${NC}"

echo -e "${BLUE}🔨 Paso 9: Compilando aplicación...${NC}"
npm run build

echo -e "${BLUE}🗄️ Paso 10: Sincronizando schema de base de datos...${NC}"
npm run db:push

echo -e "${BLUE}👤 Paso 11: Creando usuario inicial en la base de datos...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f init-database.sql
echo -e "${GREEN}✅ Usuario 'moi' creado con contraseña correcta${NC}"

echo -e "${BLUE}🔄 Paso 12: Instalando PM2 y tsx...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
# Instalar tsx globalmente para PM2
sudo npm install -g tsx

echo -e "${BLUE}📁 Paso 13: Creando directorio de logs...${NC}"
mkdir -p logs

echo -e "${BLUE}▶️ Paso 14: Iniciando aplicación con PM2 (usando ecosystem.config.cjs)...${NC}"
pm2 delete $APP_NAME 2>/dev/null || true
# Usar el archivo de configuración que maneja ES modules correctamente
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup | tail -n 1 | sudo bash

echo -e "${GREEN}✅ Aplicación iniciada con PM2${NC}"
echo ""
echo "📊 Verificando estado de la aplicación..."
pm2 status
echo ""
sleep 3
echo "📋 Logs recientes:"
pm2 logs $APP_NAME --lines 20 --nostream

echo -e "${BLUE}🌐 Paso 15: Instalando Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi

echo -e "${BLUE}⚙️ Paso 16: Configurando Nginx...${NC}"
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo -e "${BLUE}🔥 Paso 17: Configurando firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo -e "${BLUE}🔒 Paso 18: Instalando certificado SSL...${NC}"
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email tu-email@ejemplo.com

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ ¡Deployment completado!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "🌐 Tu aplicación está corriendo en:"
echo -e "   ${BLUE}https://$DOMAIN${NC}"
echo ""
echo -e "📊 Comandos útiles:"
echo -e "   ${BLUE}pm2 status${NC}         - Ver estado"
echo -e "   ${BLUE}pm2 logs $APP_NAME${NC} - Ver logs"
echo -e "   ${BLUE}pm2 restart $APP_NAME${NC} - Reiniciar"
echo -e "   ${BLUE}pm2 stop $APP_NAME${NC} - Detener"
echo ""
echo -e "🔐 Credenciales guardadas en: $APP_DIR/.env"
echo ""

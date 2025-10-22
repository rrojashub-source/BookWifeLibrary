# 🚀 Guía de Deployment - Biblioteca Moi en Hostinger VPS

## Tu VPS Actual
- **IP**: 72.60.115.169
- **OS**: Ubuntu 24.04
- **Plan**: KVM 1

## Opción A: Deployment Automático (Recomendado)

### Paso 1: Conectar a tu VPS por SSH

**En Windows** (usa PowerShell o descargar PuTTY):
```bash
ssh root@72.60.115.169
```

**En Mac/Linux** (usa Terminal):
```bash
ssh root@72.60.115.169
```

Te pedirá tu contraseña de VPS.

### Paso 2: Subir el código a tu VPS

**Opción 2A - Desde tu computadora con Git:**
```bash
# En tu VPS
cd /tmp
git clone URL_DE_TU_REPOSITORIO biblioteca-moi
# O si no tienes Git repo, usa FileZilla (ver abajo)
```

**Opción 2B - Usar FileZilla (más fácil):**
1. Descarga FileZilla: https://filezilla-project.org/
2. Conecta:
   - Host: `sftp://72.60.115.169`
   - Usuario: `root`
   - Contraseña: tu contraseña VPS
   - Puerto: `22`
3. Arrastra toda la carpeta del proyecto a `/tmp/biblioteca-moi`

### Paso 3: Ejecutar script automático

```bash
# En tu VPS
cd /tmp/biblioteca-moi
chmod +x deploy-vps.sh
./deploy-vps.sh
```

El script automáticamente:
- ✅ Instala Node.js 20
- ✅ Instala PostgreSQL
- ✅ Crea base de datos
- ✅ Instala dependencias
- ✅ Compila la aplicación
- ✅ Configura PM2
- ✅ Instala y configura Nginx
- ✅ Instala certificado SSL
- ✅ Configura firewall

### Paso 4: Apuntar tu dominio

En tu panel de Hostinger → Dominios → DNS:
```
Tipo: A
Nombre: @
Valor: 72.60.115.169
TTL: 3600

Tipo: A
Nombre: www
Valor: 72.60.115.169
TTL: 3600
```

Espera 5-30 minutos para propagación DNS.

---

## Opción B: Deployment Manual Paso a Paso

### 1. Conectar por SSH
```bash
ssh root@72.60.115.169
```

### 2. Actualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Instalar Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Debe mostrar v20.x
npm -v
```

### 4. Instalar PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 5. Crear base de datos
```bash
sudo -u postgres psql
```

En el prompt de PostgreSQL:
```sql
CREATE DATABASE biblioteca_moi;
CREATE USER biblioteca_user WITH PASSWORD 'TU_CONTRASEÑA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE biblioteca_moi TO biblioteca_user;
\c biblioteca_moi
GRANT ALL ON SCHEMA public TO biblioteca_user;
\q
```

### 6. Crear directorio y subir código
```bash
sudo mkdir -p /var/www/biblioteca-moi
sudo chown -R $USER:$USER /var/www/biblioteca-moi
cd /var/www/biblioteca-moi
```

Ahora sube tu código aquí usando FileZilla o Git.

### 7. Instalar dependencias
```bash
cd /var/www/biblioteca-moi
npm install
```

### 8. Configurar variables de entorno

Crea el archivo `.env`:
```bash
nano .env
```

Pega esto (cambia los valores):
```
DATABASE_URL=postgresql://biblioteca_user:TU_CONTRASEÑA@localhost:5432/biblioteca_moi
PGHOST=localhost
PGPORT=5432
PGUSER=biblioteca_user
PGPASSWORD=TU_CONTRASEÑA
PGDATABASE=biblioteca_moi
SESSION_SECRET=genera_un_secreto_aleatorio_largo_minimo_32_caracteres
NODE_ENV=production
PORT=5000
```

Guarda: `Ctrl+X`, luego `Y`, luego `Enter`

### 9. Compilar aplicación
```bash
npm run build
```

### 10. Sincronizar base de datos
```bash
npm run db:push
```

### 11. Instalar PM2
```bash
sudo npm install -g pm2
```

### 12. Iniciar aplicación
```bash
pm2 start npm --name "biblioteca-moi" -- start
pm2 save
pm2 startup
# Copia y ejecuta el comando que te muestre
```

### 13. Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 14. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/biblioteca-moi
```

Pega esto (cambia bibliotecamoi.com por tu dominio):
```nginx
server {
    listen 80;
    server_name bibliotecamoi.com www.bibliotecamoi.com;

    location / {
        proxy_pass http://localhost:5000;
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
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/biblioteca-moi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 15. Configurar firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 16. Instalar SSL (después de apuntar dominio)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d bibliotecamoi.com -d www.bibliotecamoi.com
```

---

## Comandos Útiles

### Ver estado de la app
```bash
pm2 status
```

### Ver logs
```bash
pm2 logs biblioteca-moi
```

### Reiniciar app
```bash
pm2 restart biblioteca-moi
```

### Detener app
```bash
pm2 stop biblioteca-moi
```

### Ver logs de Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Ver logs de PostgreSQL
```bash
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Conectar a base de datos
```bash
psql -U biblioteca_user -d biblioteca_moi -h localhost
```

---

## Actualizar la Aplicación

Cuando hagas cambios:

```bash
cd /var/www/biblioteca-moi
git pull  # Si usas Git
npm install  # Si hay nuevas dependencias
npm run build
npm run db:push  # Si hay cambios en BD
pm2 restart biblioteca-moi
```

---

## Troubleshooting

### La app no inicia
```bash
pm2 logs biblioteca-moi --lines 100
```

### Error de base de datos
```bash
sudo systemctl status postgresql
psql -U biblioteca_user -d biblioteca_moi -h localhost
```

### Error de Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Puerto 5000 ocupado
```bash
sudo lsof -i :5000
# Mata el proceso si es necesario
pm2 delete biblioteca-moi
pm2 start npm --name "biblioteca-moi" -- start
```

---

## Seguridad Adicional (Recomendado)

### Cambiar puerto SSH (prevenir ataques)
```bash
sudo nano /etc/ssh/sshd_config
# Cambia: Port 22  →  Port 2222
sudo systemctl restart sshd
```

### Configurar fail2ban (bloquear IPs maliciosas)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Backups automáticos de BD
```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-biblioteca.sh
```

Pega:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/biblioteca-moi"
mkdir -p $BACKUP_DIR
pg_dump -U biblioteca_user biblioteca_moi > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql
# Mantener solo últimos 7 días
find $BACKUP_DIR -name "backup-*.sql" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-biblioteca.sh
# Agregar a crontab (diario a las 2am)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-biblioteca.sh") | crontab -
```

---

## ✅ Checklist de Deployment

- [ ] Conectado a VPS por SSH
- [ ] Node.js 20 instalado
- [ ] PostgreSQL instalado y configurado
- [ ] Base de datos creada
- [ ] Código subido a `/var/www/biblioteca-moi`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Aplicación compilada (`npm run build`)
- [ ] Schema de BD sincronizado (`npm run db:push`)
- [ ] PM2 instalado y app corriendo
- [ ] Nginx instalado y configurado
- [ ] Firewall configurado
- [ ] Dominio apuntando a IP del VPS
- [ ] SSL instalado (certbot)
- [ ] ✅ Aplicación accesible en https://tudominio.com

---

## Contacto y Soporte

Si tienes problemas, revisa los logs:
```bash
pm2 logs biblioteca-moi
sudo tail -f /var/log/nginx/error.log
```

¡Buena suerte con tu deployment! 🚀

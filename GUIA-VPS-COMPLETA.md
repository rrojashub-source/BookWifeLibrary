# 📚 Guía Completa de Deployment VPS - Para Aprender

Esta guía te enseña paso a paso cómo deployar una aplicación Node.js/React en un VPS. Úsala como referencia para tus proyectos futuros de empresa.

## 🎯 ¿Qué Aprenderás?

- Configurar un servidor Linux desde cero
- Instalar y configurar Node.js, PostgreSQL, PM2 y Nginx
- Manejar variables de entorno y secretos
- Configurar SSL/HTTPS automático
- Solucionar problemas comunes

---

## 📋 Arquitectura del Deployment

```
Internet (HTTPS) → Nginx (Reverse Proxy) → Node.js App (Puerto 5000) → PostgreSQL
                         ↓
                    Let's Encrypt SSL
```

**Componentes explicados:**

1. **Nginx**: Recibe todas las peticiones HTTP/HTTPS y las redirige a tu app
2. **PM2**: Mantiene tu app Node.js corriendo 24/7, reinicia si falla
3. **PostgreSQL**: Base de datos
4. **Let's Encrypt**: Certificados SSL gratis (HTTPS)

---

## 🔧 Problemas que Arreglamos (y Por Qué)

### Problema 1: PM2 + ES Modules
**Error:** `Cannot use import statement outside a module`

**Causa:** PM2 no maneja bien ES modules (import/export) por defecto

**Solución:** Usar `ecosystem.config.cjs` con tsx
```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'biblioteca-moi',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx'  // ← Esto permite usar TS + ES modules
  }]
};
```

**Lección:** Cuando uses `import`/`export` con PM2, necesitas un transpilador como `tsx` o `ts-node`.

---

### Problema 2: Contraseñas Hasheadas
**Error:** No se puede hacer login con contraseña en texto plano

**Causa:** La app usa `scrypt` para hashear contraseñas (seguridad)

**Solución:** Script SQL que inserta el hash correcto
```sql
-- init-database.sql
INSERT INTO users (username, password) VALUES (
  'moi',
  'hash.salt'  -- ← Formato especial: hash + punto + salt
);
```

**Lección:** NUNCA guardes contraseñas en texto plano. Usa hashing (bcrypt, scrypt, argon2).

---

### Problema 3: Variables de Entorno
**Error:** `.env` no se carga en producción

**Causa:** PM2 no carga archivos `.env` automáticamente

**Solución:** Definir variables en `ecosystem.config.cjs`
```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 5000
}
```

**Lección:** En producción, las variables de entorno se configuran a nivel de sistema, no con archivos `.env`.

---

### Problema 4: Health Check para Deployment
**Error:** Replit deployment timeout

**Causa:** No había endpoint rápido para verificar que la app está corriendo

**Solución:** Agregar `/health` endpoint
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

**Lección:** Siempre ten un endpoint `/health` o `/ping` para monitoring.

---

## 🚀 Proceso de Deployment Paso a Paso

### Fase 1: Preparación (En tu computadora)

#### 1. Preparar el código
```bash
# Asegúrate de que tu código esté en Git
git add .
git commit -m "Preparar para deployment"
git push origin main
```

**Por qué:** Git facilita actualizar tu app después.

#### 2. Verificar archivos necesarios
```bash
# Estos archivos deben existir:
deploy-vps.sh          # Script automático
ecosystem.config.cjs   # Configuración PM2
init-database.sql      # Usuario inicial
.env.example          # Template de variables
```

---

### Fase 2: Servidor (Conectado por SSH)

#### 3. Conectar a VPS
```bash
ssh root@72.60.115.169
```

**Por qué:** Necesitas acceso administrativo al servidor.

#### 4. Subir el código

**Opción A - Con Git (Recomendado):**
```bash
cd /tmp
git clone https://github.com/rrojashub-source/BookWifeLibrary.git biblioteca-moi
cd biblioteca-moi
```

**Opción B - Con FileZilla:**
1. Conectar SFTP a `72.60.115.169`
2. Subir carpeta completa a `/tmp/biblioteca-moi`

**Por qué:** El código debe estar en el servidor para ejecutarse.

#### 5. Ejecutar deployment
```bash
cd /tmp/biblioteca-moi
chmod +x deploy-vps.sh
./deploy-vps.sh
```

**Qué hace el script:**

1. **Actualiza Ubuntu**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
   - Instala parches de seguridad

2. **Instala Node.js 20**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
   - Node.js es el runtime de JavaScript

3. **Instala PostgreSQL**
   ```bash
   sudo apt install -y postgresql
   ```
   - Base de datos relacional

4. **Crea base de datos y usuario**
   ```sql
   CREATE DATABASE biblioteca_moi;
   CREATE USER biblioteca_user WITH PASSWORD 'contraseña_aleatoria';
   GRANT ALL PRIVILEGES...
   ```
   - Usuario dedicado (seguridad)

5. **Instala dependencias NPM**
   ```bash
   npm install
   ```
   - Instala paquetes del proyecto

6. **Compila la app**
   ```bash
   npm run build
   ```
   - Vite compila React a archivos estáticos

7. **Sincroniza schema de BD**
   ```bash
   npm run db:push
   ```
   - Drizzle crea las tablas

8. **Inserta usuario inicial**
   ```bash
   psql -f init-database.sql
   ```
   - Crea usuario "moi" con contraseña correcta

9. **Instala PM2 y tsx**
   ```bash
   npm install -g pm2 tsx
   ```
   - PM2: process manager
   - tsx: TypeScript executor

10. **Inicia app con PM2**
    ```bash
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    pm2 startup
    ```
    - `pm2 save`: guarda config
    - `pm2 startup`: inicia al arrancar servidor

11. **Instala y configura Nginx**
    ```bash
    sudo apt install -y nginx
    # Crea config en /etc/nginx/sites-available/
    ```
    - Nginx hace de proxy inverso

12. **Configura firewall**
    ```bash
    sudo ufw allow 22  # SSH
    sudo ufw allow 80  # HTTP
    sudo ufw allow 443 # HTTPS
    ```
    - Solo abre puertos necesarios

13. **Instala SSL con Let's Encrypt**
    ```bash
    sudo certbot --nginx -d bibliotecamoi.com
    ```
    - HTTPS gratis y automático

---

### Fase 3: DNS (Panel de Hostinger)

#### 6. Configurar DNS
En Hostinger → Dominios → DNS → bibliotecamoi.com:

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

**Por qué:** Conecta tu dominio con la IP del servidor.

**Tiempo:** 5-30 minutos de propagación.

---

## 🔍 Verificación y Testing

### Verificar que PM2 está corriendo
```bash
pm2 status
```

Deberías ver:
```
┌─────┬──────────────────┬─────────┬─────────┬─────────┐
│ id  │ name             │ mode    │ status  │ cpu     │
├─────┼──────────────────┼─────────┼─────────┼─────────┤
│ 0   │ biblioteca-moi   │ fork    │ online  │ 0%      │
└─────┴──────────────────┴─────────┴─────────┴─────────┘
```

### Ver logs de la app
```bash
pm2 logs biblioteca-moi
```

### Verificar Nginx
```bash
sudo systemctl status nginx
sudo nginx -t  # Test de configuración
```

### Verificar PostgreSQL
```bash
sudo systemctl status postgresql
```

### Test de la app
```bash
# Desde tu VPS
curl http://localhost:5000/health

# Debería responder:
{"status":"ok","timestamp":"2025-10-22..."}
```

### Test desde internet
```bash
# Desde tu computadora
curl https://bibliotecamoi.com/health
```

---

## 🐛 Troubleshooting Común

### App no inicia
```bash
# Ver logs detallados
pm2 logs biblioteca-moi --lines 100

# Ver errores de npm
cat logs/err.log
```

**Causas comunes:**
- Variables de entorno faltantes
- Puerto ocupado
- Errores de TypeScript

### Base de datos no conecta
```bash
# Verificar que PostgreSQL corre
sudo systemctl status postgresql

# Conectar manualmente
psql -h localhost -U biblioteca_user -d biblioteca_moi

# Si falla, revisar:
# - Contraseña en .env
# - Permisos de usuario
```

### Nginx 502 Bad Gateway
```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

**Causas comunes:**
- App Node.js no está corriendo (revisar PM2)
- Puerto incorrecto en Nginx config

### SSL no funciona
```bash
# Renovar certificado
sudo certbot renew

# Ver status
sudo certbot certificates
```

---

## 📊 Comandos Útiles de PM2

```bash
# Ver todas las apps
pm2 status

# Ver logs en tiempo real
pm2 logs biblioteca-moi

# Reiniciar app
pm2 restart biblioteca-moi

# Detener app
pm2 stop biblioteca-moi

# Iniciar app
pm2 start biblioteca-moi

# Eliminar app de PM2
pm2 delete biblioteca-moi

# Ver uso de recursos
pm2 monit

# Ver info detallada
pm2 info biblioteca-moi
```

---

## 🔄 Actualizar la App (Después del primer deployment)

```bash
# Conectar por SSH
ssh root@72.60.115.169

# Ir al directorio
cd /var/www/biblioteca-moi

# Descargar cambios
git pull origin main

# Instalar nuevas dependencias (si hay)
npm install

# Recompilar
npm run build

# Actualizar schema BD (si cambió)
npm run db:push

# Reiniciar app
pm2 restart biblioteca-moi

# Ver logs para confirmar
pm2 logs biblioteca-moi --lines 50
```

---

## 🎓 Conceptos Clave para tus Proyectos de Empresa

### 1. Separación de Ambientes
- **Desarrollo**: Tu computadora local
- **Producción**: VPS con usuarios reales

### 2. Variables de Entorno
- NUNCA subas `.env` a Git
- Usa diferentes valores en dev vs producción
- Guarda secretos en el servidor, no en código

### 3. Process Management
- PM2 mantiene tu app corriendo
- Reinicia automáticamente si falla
- Logs centralizados

### 4. Reverse Proxy
- Nginx maneja SSL
- Load balancing (múltiples instancias)
- Cacheo de archivos estáticos

### 5. Seguridad
- Firewall solo abre puertos necesarios
- SSL/HTTPS obligatorio
- Usuarios de BD con permisos mínimos
- Contraseñas hasheadas

### 6. Monitoring
- Health checks (`/health`)
- Logs (`pm2 logs`)
- Métricas (`pm2 monit`)

---

## 📝 Checklist para Futuros Proyectos

Antes de deployar una nueva app:

- [ ] Código en Git
- [ ] `.env.example` con todas las variables
- [ ] Script `deploy-vps.sh` adaptado
- [ ] `ecosystem.config.cjs` configurado
- [ ] Endpoint `/health` implementado
- [ ] Build funciona (`npm run build`)
- [ ] Variables de entorno documentadas
- [ ] Usuario inicial de BD preparado
- [ ] Dominio comprado y DNS configurado
- [ ] Backup plan de la BD

---

## 🆘 Recursos Adicionales

- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Certbot**: https://certbot.eff.org/

---

## 💡 Próximos Pasos para Mejorar

1. **Backups automáticos** de base de datos
2. **Monitoring con Uptime Robot** o similar
3. **CI/CD con GitHub Actions** (deploy automático)
4. **Load balancer** si crece el tráfico
5. **CDN** para archivos estáticos (Cloudflare)

---

**¿Listo para deployar?** Sigue esta guía paso a paso y tendrás tu app en producción. Guarda esta guía para tus proyectos de empresa. 🚀

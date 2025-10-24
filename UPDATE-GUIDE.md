# Guía de Actualización para Claude Code

Esta guía explica cómo actualizar la versión en producción de **bibliotecamoi.com** desde GitHub usando el VPS.

## 🎯 Objetivo

Cuando se hacen cambios en el código y se suben a GitHub, este proceso actualiza automáticamente la versión HTTPS en producción.

## 📋 Requisitos Previos

- Código actualizado en GitHub (rama main)
- Acceso SSH al VPS: ssh root@72.60.115.169
- Claude Code con permisos de terminal

## 🚀 Proceso de Actualización

### Opción A: Script Automático (Recomendado)

```bash
# 1. Conectar al VPS
ssh root@72.60.115.169

# 2. Ir al directorio de la aplicación
cd /var/www/biblioteca-moi

# 3. Ejecutar el script de actualización
bash update-from-github.sh
```

El script hace automáticamente:
1. ✅ Guarda cambios locales (git stash)
2. ✅ Descarga últimos cambios (git pull)
3. ✅ Instala dependencias (npm install)
4. ✅ Compila la app (npm run build)
5. ✅ Reinicia PM2
6. ✅ Verifica que todo funcione

### Opción B: Comandos Manuales

Si prefieres hacerlo paso a paso:

```bash
cd /var/www/biblioteca-moi

# 1. Actualizar código
git pull origin main

# 2. ⚠️ IMPORTANTE: Verificar si hay nuevas migraciones
ls -la migrations/*.sql
# Si hay nuevos archivos, aplica las migraciones:
PGPASSWORD=biblioteca_secure_password_2025 psql -h localhost -U biblioteca_user -d biblioteca_moi -f migrations/NNN_nombre.sql

# 3. Instalar dependencias
npm install

# 4. Compilar
npm run build

# 5. Reiniciar
pm2 restart biblioteca-moi

# 6. Verificar
pm2 logs biblioteca-moi --lines 20
```

## 🗄️ Migraciones de Base de Datos

**⚠️ CRÍTICO:** Después de cada git pull, SIEMPRE verifica si hay nuevas migraciones en migrations/

### Aplicar Migraciones

```bash
cd /var/www/biblioteca-moi

# Listar migraciones disponibles
ls -la migrations/

# Aplicar migración específica
PGPASSWORD=biblioteca_secure_password_2025 psql -h localhost -U biblioteca_user -d biblioteca_moi -f migrations/001_add_enrichment_fields.sql

# Verificar que se aplicó correctamente
PGPASSWORD=biblioteca_secure_password_2025 psql -h localhost -U biblioteca_user -d biblioteca_moi -c "\d books"
```

### ¿Cuándo Aplicar Migraciones?

- ✅ Después de git pull, ANTES de npm run build
- ✅ Si ves errores como "column X does not exist"
- ✅ Si el schema.ts tiene campos nuevos que la DB no tiene

Ver más detalles en: migrations/README.md

## 🔍 Verificación

Después de actualizar, verifica que la app funciona:

1. Verificar PM2: pm2 status biblioteca-moi → Debe estar "online"
2. Verificar logs: pm2 logs biblioteca-moi --lines 20 → No debe haber errores
3. Verificar endpoint: curl http://localhost:5000/health → Debe responder "OK"
4. Verificar web: Abrir https://bibliotecamoi.com en el navegador

## 🐛 Solución de Problemas

### Error: "column X does not exist"
```bash
# Verificar qué migraciones necesitas
ls migrations/
# Aplicar la migración correspondiente
PGPASSWORD=biblioteca_secure_password_2025 psql -h localhost -U biblioteca_user -d biblioteca_moi -f migrations/001_add_enrichment_fields.sql
# Reiniciar app
pm2 restart biblioteca-moi
```

### Error: "Cannot find module"
```bash
cd /var/www/biblioteca-moi
rm -rf node_modules
npm install
npm run build
pm2 restart biblioteca-moi
```

### Error: PM2 muestra "error" o "stopped"
```bash
pm2 logs biblioteca-moi --lines 50  # Ver el error específico
pm2 restart biblioteca-moi
```

### Error: 502 Bad Gateway en el navegador
```bash
# Verificar que el puerto 5000 esté activo
netstat -tulpn | grep 5000

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar logs de Nginx
sudo journalctl -xeu nginx.service --no-pager | tail -30
```

### Revertir a versión anterior (Rollback)
```bash
cd /var/www/biblioteca-moi
git log --oneline -5  # Ver últimos commits
git reset --hard <commit-hash>  # Revertir a commit específico
npm install
npm run build
pm2 restart biblioteca-moi
```

## 📊 Información del VPS

- Servidor: Hostinger KVM 1, Ubuntu 24.04
- IP: 72.60.115.169
- Dominio: bibliotecamoi.com
- URL: https://bibliotecamoi.com
- Puerto interno: 5000
- Proceso: PM2 (biblioteca-moi)
- Web server: Nginx (proxy reverso)
- SSL: Let's Encrypt (auto-renovación)
- Base de datos: PostgreSQL 16 (localhost:5432)

## 📁 Estructura de Directorios

```
/var/www/biblioteca-moi/
├── client/              # Frontend React
├── server/              # Backend Express
├── shared/              # Código compartido (schema.ts)
├── migrations/          # Migraciones SQL de base de datos
├── dist/                # App compilada
├── node_modules/        # Dependencias
├── ecosystem.config.cjs # Configuración PM2
├── update-from-github.sh # Script de actualización
└── package.json
```

## 🔐 Variables de Ambiente

Las variables de ambiente están en .env:

```bash
DATABASE_URL=postgresql://biblioteca_user:biblioteca_secure_password_2025@localhost:5432/biblioteca_moi
SESSION_SECRET=biblioteca_moi_secret_key_2025_production_secure
NODE_ENV=production
PORT=5000
```

## 📝 Notas para Claude Code

- SIEMPRE verifica que el script update-from-github.sh tenga permisos de ejecución
- SIEMPRE revisa si hay nuevas migraciones después de git pull
- Si falla algo, revisa los logs: pm2 logs biblioteca-moi
- No hagas npm install --production porque la app necesita todas las dependencias
- Verifica que GitHub tenga los últimos cambios antes de ejecutar

## ✅ Checklist de Actualización

- [ ] Código actualizado en GitHub (rama main)
- [ ] Conectado al VPS vía SSH
- [ ] Ejecutado git pull origin main
- [ ] ⚠️ Aplicadas nuevas migraciones SQL (si existen)
- [ ] Ejecutado npm install
- [ ] Ejecutado npm run build
- [ ] Reiniciado PM2
- [ ] PM2 muestra estado "online"
- [ ] No hay errores en logs
- [ ] https://bibliotecamoi.com carga correctamente
- [ ] Funcionalidades principales funcionan

## 📜 Historial de Actualizaciones

### 2025-10-24: Migración 001 - Book Enrichment Fields
- Agregados 7 campos nuevos a tabla books: language, edition, synopsis, series, series_number, publisher, published_date
- Aplicada migración: migrations/001_add_enrichment_fields.sql
- Schema sincronizado con código

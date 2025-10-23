# Guía de Actualización para Claude Code

Esta guía explica cómo actualizar la versión en producción de **bibliotecamoi.com** desde GitHub usando el VPS.

## 🎯 Objetivo

Cuando se hacen cambios en el código y se suben a GitHub, este proceso actualiza automáticamente la versión HTTPS en producción.

## 📋 Requisitos Previos

- Código actualizado en GitHub (rama `main`)
- Acceso SSH al VPS: `ssh root@72.60.115.169`
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

El script hace **automáticamente**:
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

# 2. Instalar dependencias
npm install

# 3. Compilar
npm run build

# 4. Reiniciar
pm2 restart biblioteca-moi

# 5. Verificar
pm2 logs biblioteca-moi --lines 20
```

## 🔍 Verificación

Después de actualizar, verifica que la app funciona:

1. **Verificar PM2**: `pm2 status biblioteca-moi` → Debe estar "online"
2. **Verificar logs**: `pm2 logs biblioteca-moi --lines 20` → No debe haber errores
3. **Verificar endpoint**: `curl http://localhost:5000/health` → Debe responder "OK"
4. **Verificar web**: Abrir https://bibliotecamoi.com en el navegador

## 🐛 Solución de Problemas

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

- **Servidor**: Hostinger KVM 1, Ubuntu 24.04
- **IP**: 72.60.115.169
- **Dominio**: bibliotecamoi.com
- **URL**: https://bibliotecamoi.com
- **Puerto interno**: 5000
- **Proceso**: PM2 (biblioteca-moi)
- **Web server**: Nginx (proxy reverso)
- **SSL**: Let's Encrypt (auto-renovación)

## 📁 Estructura de Directorios

```
/var/www/biblioteca-moi/
├── client/              # Frontend React
├── server/              # Backend Express
├── shared/              # Código compartido
├── dist/                # App compilada
├── node_modules/        # Dependencias
├── ecosystem.config.cjs # Configuración PM2
├── update-from-github.sh # Este script de actualización
└── package.json
```

## 🔐 Variables de Ambiente

Las variables de ambiente están en `ecosystem.config.cjs`:

```javascript
{
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://biblioteca_user:BibliotecaMoi2024@localhost:5432/biblioteca_moi',
  SESSION_SECRET: 'mi_secreto_super_seguro_12345'
}
```

## 📝 Notas para Claude Code

- **Siempre verifica** que el script `update-from-github.sh` tenga permisos de ejecución
- **Si falla algo**, revisa los logs: `pm2 logs biblioteca-moi`
- **No hagas** `npm install --production` porque la app necesita todas las dependencias
- **Verifica** que GitHub tenga los últimos cambios antes de ejecutar

## ✅ Checklist de Actualización

- [ ] Código actualizado en GitHub (rama main)
- [ ] Conectado al VPS vía SSH
- [ ] Ejecutado `update-from-github.sh`
- [ ] PM2 muestra estado "online"
- [ ] No hay errores en logs
- [ ] https://bibliotecamoi.com carga correctamente
- [ ] Funcionalidades principales funcionan

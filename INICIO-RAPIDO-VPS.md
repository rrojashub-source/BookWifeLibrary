# 🚀 Inicio Rápido - Deployment en tu VPS Hostinger

## Tu VPS
- **IP**: `72.60.115.169`
- **OS**: Ubuntu 24.04 con n8n
- **Plan**: KVM 1

---

## Método Más Fácil (5 pasos)

### 1️⃣ Conectar a tu VPS

**Desde Windows PowerShell:**
```bash
ssh root@72.60.115.169
```
*(Escribe tu contraseña de VPS)*

### 2️⃣ Descargar el código

Tienes 2 opciones:

**Opción A - Si tienes el código en GitHub:**
```bash
cd /tmp
git clone https://github.com/tu-usuario/biblioteca-moi.git
cd biblioteca-moi
```

**Opción B - Subir con FileZilla (recomendado):**
1. Descarga FileZilla: https://filezilla-project.org/
2. Conecta:
   - **Host**: `sftp://72.60.115.169`
   - **Usuario**: `root`
   - **Contraseña**: (tu contraseña VPS)
   - **Puerto**: `22`
3. Arrastra la carpeta completa del proyecto a: `/tmp/biblioteca-moi`

### 3️⃣ Ejecutar instalación automática

```bash
cd /tmp/biblioteca-moi
chmod +x deploy-vps.sh
./deploy-vps.sh
```

*El script tardará 10-15 minutos y hará todo automáticamente.*

### 4️⃣ Configurar tu dominio

En tu panel de Hostinger → **DNS Settings**:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | 72.60.115.169 | 3600 |
| A | www | 72.60.115.169 | 3600 |

**Espera 10-30 minutos** para que el DNS se propague.

### 5️⃣ Instalar certificado SSL

```bash
# Edita el script primero con tu dominio y email
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

---

## ✅ ¡Listo!

Tu aplicación estará en: **https://tudominio.com**

---

## Comandos Útiles

```bash
# Ver si la app está corriendo
pm2 status

# Ver logs de errores
pm2 logs biblioteca-moi

# Reiniciar la app
pm2 restart biblioteca-moi

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## Si algo falla

1. **Ver logs de la app:**
   ```bash
   pm2 logs biblioteca-moi --lines 50
   ```

2. **Ver si PostgreSQL está corriendo:**
   ```bash
   sudo systemctl status postgresql
   ```

3. **Reiniciar todo:**
   ```bash
   pm2 restart biblioteca-moi
   sudo systemctl restart nginx
   ```

---

## Crear tu primer usuario

Una vez la app esté corriendo, abre: `https://tudominio.com/auth`

- Usuario: `moi` (o el que quieras)
- Contraseña: tu contraseña

**NOTA:** El registro público está deshabilitado por seguridad. Si necesitas crear otro usuario, puedes hacerlo directamente en la base de datos o modificar temporalmente el código.

---

## Archivo de configuración importante

Tu archivo `.env` se creará automáticamente con:
- Credenciales de base de datos
- Secret de sesión
- Variables de entorno

**Ubicación:** `/var/www/biblioteca-moi/.env`

---

## ¿Dudas?

Lee la guía completa en: `DEPLOYMENT.md`

O contáctame para ayuda adicional.

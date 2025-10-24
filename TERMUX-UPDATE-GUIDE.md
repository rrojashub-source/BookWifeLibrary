# 📱 Guía de Actualización desde Termux (Android)

Esta guía te permite actualizar **bibliotecamoi.com** desde tu teléfono Android usando Termux.

## 📋 Requisitos Previos

1. **Termux instalado** en tu Android (desde F-Droid o Google Play)
2. **Código actualizado en GitHub** (rama main)
3. **Conexión a Internet**

---

## 🚀 PASO 1: Configurar Termux (Solo la primera vez)

### 1.1 Abrir Termux e instalar SSH

```bash
# Actualizar paquetes de Termux
pkg update && pkg upgrade

# Instalar OpenSSH (cliente SSH)
pkg install openssh

# Instalar Git (opcional, para verificar)
pkg install git

# Verificar que SSH está instalado
ssh -V
```

### 1.2 Dar permisos de almacenamiento (opcional)

```bash
termux-setup-storage
```

---

## 🔑 PASO 2: Conectar al VPS

### 2.1 Conectar vía SSH

```bash
ssh root@72.60.115.169
```

**Te pedirá la contraseña del VPS:**
- Escribe la contraseña (no se verá mientras escribes, es normal)
- Presiona Enter

**Si es la primera vez**, te preguntará:
```
Are you sure you want to continue connecting (yes/no)?
```
Escribe `yes` y presiona Enter.

### 2.2 Verificar que estás conectado

Deberías ver algo como:
```
root@servidor:~#
```

---

## 📦 PASO 3: Actualizar la Aplicación

### 3.1 Ir al directorio de la aplicación

```bash
cd /var/www/biblioteca-moi
```

### 3.2 Ejecutar el script de actualización automática

```bash
bash update-from-github.sh
```

**El script hará automáticamente:**
1. ✅ Guardar cambios locales
2. ✅ Descargar últimos cambios de GitHub
3. ✅ Instalar dependencias
4. ✅ Compilar la aplicación
5. ✅ Reiniciar PM2
6. ✅ Verificar que todo funcione

### 3.3 Esperar a que termine

Verás mensajes como:
```
🚀 Iniciando actualización desde GitHub...
📦 Guardando cambios locales temporalmente...
⬇️  Descargando últimos cambios desde GitHub...
📚 Instalando dependencias...
🔨 Compilando aplicación...
🔄 Reiniciando aplicación con PM2...
✅ Aplicación actualizada exitosamente
🎉 ¡Actualización completada!
```

---

## 🔍 PASO 4: Verificar que todo funciona

### 4.1 Ver estado de PM2

```bash
pm2 status biblioteca-moi
```

Debe mostrar: `status: online`

### 4.2 Ver los logs (últimas líneas)

```bash
pm2 logs biblioteca-moi --lines 20
```

### 4.3 Probar el endpoint de salud

```bash
curl http://localhost:5000/health
```

Debe responder: `OK`

### 4.4 Abrir en el navegador

Abre tu navegador y ve a: **https://bibliotecamoi.com**

---

## 🚪 PASO 5: Salir del VPS

```bash
exit
```

Ya estás de vuelta en tu Termux local.

---

## 🐛 Solución de Problemas en Termux

### Error: "ssh: command not found"

```bash
pkg install openssh
```

### Error: "Permission denied (publickey)"

Asegúrate de usar la contraseña correcta del VPS. La conexión está configurada con contraseña, no con llave SSH.

### Error: "Could not resolve hostname"

Verifica tu conexión a Internet. Intenta:
```bash
ping 72.60.115.169
```

### La pantalla se vuelve negra / Termux se cierra

Termux puede cerrarse en segundo plano. Vuelve a abrir la app y reconecta:
```bash
ssh root@72.60.115.169
```

### El script falla con "npm install"

Conéctate de nuevo y prueba manualmente:
```bash
ssh root@72.60.115.169
cd /var/www/biblioteca-moi
npm install
npm run build
pm2 restart biblioteca-moi
```

---

## 📝 Comandos Rápidos (Copiar y Pegar)

### Actualización Completa (Todo en Uno)

```bash
# Conectar y actualizar en un solo comando
ssh root@72.60.115.169 'cd /var/www/biblioteca-moi && bash update-from-github.sh'
```

Te pedirá la contraseña y luego ejecutará todo automáticamente.

### Ver Logs Remotamente

```bash
ssh root@72.60.115.169 'pm2 logs biblioteca-moi --lines 20'
```

### Ver Estado de PM2 Remotamente

```bash
ssh root@72.60.115.169 'pm2 status'
```

---

## 💡 Tips para Termux

1. **Copiar texto en Termux:**
   - Mantén presionado en la pantalla
   - Selecciona el texto
   - Aparecerá "Copy" arriba

2. **Pegar texto en Termux:**
   - Mantén presionado en la pantalla
   - Selecciona "Paste"
   - O usa: `Volumen Abajo + V`

3. **Limpiar pantalla:**
   ```bash
   clear
   ```

4. **Historial de comandos:**
   - Flecha arriba para ver comandos anteriores
   - O desliza de izquierda a derecha en el teclado

5. **Salir de SSH rápido:**
   - Presiona `Ctrl + D`
   - O escribe `exit`

---

## 📊 Información del VPS

- **IP**: 72.60.115.169
- **Usuario**: root
- **Puerto SSH**: 22 (por defecto)
- **Directorio**: /var/www/biblioteca-moi
- **URL producción**: https://bibliotecamoi.com
- **Proceso PM2**: biblioteca-moi

---

## ✅ Checklist de Actualización

- [ ] Termux instalado y SSH configurado
- [ ] Código actualizado en GitHub (rama main)
- [ ] Conectado al VPS con éxito
- [ ] Script `update-from-github.sh` ejecutado sin errores
- [ ] PM2 muestra estado "online"
- [ ] Logs no muestran errores
- [ ] https://bibliotecamoi.com carga correctamente
- [ ] Funcionalidades principales funcionan
- [ ] Salido del VPS con `exit`

---

## 🎯 Resumen Ultra-Rápido

```bash
# 1. Abrir Termux
# 2. Conectar al VPS
ssh root@72.60.115.169

# 3. Ir al directorio
cd /var/www/biblioteca-moi

# 4. Actualizar
bash update-from-github.sh

# 5. Verificar
pm2 status biblioteca-moi

# 6. Salir
exit
```

---

## 🆘 Ayuda Extra

Si algo no funciona:
1. Verifica que GitHub tenga los últimos cambios
2. Revisa que el VPS esté en línea: `ping 72.60.115.169`
3. Verifica los logs: `pm2 logs biblioteca-moi`
4. Reinicia PM2: `pm2 restart biblioteca-moi`
5. Reinicia Nginx: `sudo systemctl restart nginx`

**¡Listo!** 🎉

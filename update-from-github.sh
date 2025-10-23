#!/bin/bash

# Script de actualización automática desde GitHub para bibliotecamoi.com
# Uso: bash update-from-github.sh
# Este script debe ejecutarse en el VPS en el directorio /var/www/biblioteca-moi

set -e  # Salir si hay algún error

echo "🚀 Iniciando actualización desde GitHub..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json no encontrado${NC}"
    echo "Este script debe ejecutarse desde /var/www/biblioteca-moi"
    exit 1
fi

# 1. Guardar cambios locales si los hay (stash)
echo -e "${YELLOW}📦 Guardando cambios locales temporalmente...${NC}"
git stash

# 2. Actualizar desde GitHub
echo -e "${YELLOW}⬇️  Descargando últimos cambios desde GitHub...${NC}"
git pull origin main

# 3. Instalar/actualizar dependencias
echo -e "${YELLOW}📚 Instalando dependencias...${NC}"
npm install

# 4. Compilar la aplicación
echo -e "${YELLOW}🔨 Compilando aplicación...${NC}"
npm run build

# 5. Reiniciar PM2
echo -e "${YELLOW}🔄 Reiniciando aplicación con PM2...${NC}"
pm2 restart biblioteca-moi

# 6. Esperar 3 segundos para que la app inicie
sleep 3

# 7. Verificar estado
echo -e "${YELLOW}🔍 Verificando estado de la aplicación...${NC}"
pm2 status biblioteca-moi

# 8. Verificar que el servidor responde
echo -e "${YELLOW}🌐 Probando endpoint de salud...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Aplicación actualizada exitosamente${NC}"
    echo -e "${GREEN}✅ La app está respondiendo correctamente${NC}"
    echo ""
    echo "🌐 URL de producción: https://bibliotecamoi.com"
    echo ""
    echo "Para ver los logs en tiempo real:"
    echo "  pm2 logs biblioteca-moi"
else
    echo -e "${RED}⚠️  Advertencia: La app no responde correctamente (HTTP $HTTP_CODE)${NC}"
    echo "Revisa los logs con: pm2 logs biblioteca-moi"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 ¡Actualización completada!${NC}"

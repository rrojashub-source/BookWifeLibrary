# Biblioteca Moi

## Descripción General
Aplicación web de gestión de biblioteca personal diseñada específicamente para llevar un control detallado de una colección de libros católicos y espirituales, progreso de lectura, y estadísticas tanto mensuales como anuales. La aplicación está optimizada para uso en iPhone, tablet y escritorio con un diseño elegante en turquesa y blanco.

## Características Principales

### Gestión de Libros
- **Catálogo completo** con vista en tarjetas elegantes
- **Búsqueda automática por ISBN** usando Open Library API
- **Entrada manual** de todos los datos del libro
- **Portadas de libros** con soporte para URLs personalizadas
- **Tres estados de lectura**: Por Leer, Leyendo, Terminado
- **Sistema de calificación** de 1-5 estrellas para libros terminados
- **Reseñas personales** para cada libro

### Dashboard de Estadísticas
- Libros leídos por mes y año
- **Páginas leídas por mes y año**
- Gráficos visuales interactivos (barras y líneas)
- Comparación mensual de libros vs páginas
- Estadísticas en tiempo real del mes actual
- Resumen del año en curso

### Filtros y Búsqueda
- Búsqueda por título o autor
- Filtro por estado de lectura
- Filtro por género
- Interfaz responsive optimizada para móvil

### Diccionario Personal
- **Registro de palabras** encontradas durante la lectura
- **Búsqueda automática** de definiciones usando Spanish Dictionary API
- **Asociación opcional** con libros de la biblioteca
- **Notas personales** para contexto adicional
- CRUD completo: crear, editar y eliminar entradas
- Vista en tarjetas elegantes con iconografía

## Arquitectura Técnica

### Frontend
- **React** con TypeScript
- **Wouter** para routing
- **TanStack Query** para gestión de estado del servidor
- **React Hook Form** con validación Zod
- **Shadcn UI** + **Tailwind CSS** para componentes
- **Recharts** para visualizaciones de datos
- **date-fns** para manejo de fechas

### Backend
- **Express.js** servidor API REST
- **PostgreSQL** (Neon) para persistencia
- **Drizzle ORM** para queries type-safe
- **Zod** para validación de schemas

### Base de Datos
Tabla `users`:
- id (serial)
- username (unique)
- password (hashed with scrypt)
- createdAt

Tabla `books`:
- id (UUID)
- title, author, isbn
- pages, coverUrl, genre
- status (por_leer | leyendo | terminado)
- rating (1-5), review
- startDate, finishDate, dateAdded

Tabla `dictionary_entries`:
- id (UUID)
- word, definition, notes
- bookId (foreign key a books, opcional, set null on delete)
- userId (foreign key a users)
- createdAt

## API Endpoints

### Autenticación
- `POST /api/register` - Registrar nuevo usuario (validación Zod, contraseña hasheada)
- `POST /api/login` - Iniciar sesión (validación Zod, cookies seguras)
- `POST /api/logout` - Cerrar sesión
- `GET /api/user` - Obtener usuario actual (requiere autenticación)

### Libros
- `GET /api/books` - Obtener todos los libros
- `GET /api/books/:id` - Obtener un libro específico
- `POST /api/books` - Crear nuevo libro
- `PATCH /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro

### Estadísticas
- `GET /api/stats` - Dashboard con estadísticas completas

### Diccionario
- `GET /api/dictionary` - Obtener todas las entradas del diccionario
- `GET /api/dictionary/:id` - Obtener una entrada específica
- `POST /api/dictionary` - Crear nueva entrada
- `PATCH /api/dictionary/:id` - Actualizar entrada
- `DELETE /api/dictionary/:id` - Eliminar entrada

## Diseño Visual

### Tema
- Paleta de colores elegante: Turquesa (#2ba09f) con blanco
- Diseño sofisticado y calmado, perfecto para lectura espiritual
- Soporte completo para modo oscuro/claro
- Tipografía: Playfair Display (serif) + Inter (sans-serif)
- Dedicatoria personal en el sidebar
- Imagen de la Virgen María Reina de la Paz (Medjugorje)

### Responsive Design
- Mobile-first approach
- Sidebar colapsable en móvil
- Optimizado para iPhone con meta tags PWA
- Safe area padding para notch/Dynamic Island

## Estado del Proyecto

**Última actualización**: Octubre 2025

### Características Implementadas ✅
- ✅ **Autenticación Privada** - Solo login (registro público deshabilitado por seguridad)
- ✅ **Sesiones Seguras** - PostgreSQL session store + cookies httpOnly + Passport.js
- ✅ **Diseño Turquesa Elegante** - Paleta turquesa/blanco optimizada para contenido espiritual
- ✅ **Branding Personalizado** - "Biblioteca Moi" con dedicatoria romántica
- ✅ **Iconografía Religiosa** - Imagen de la Virgen María Reina de la Paz
- ✅ CRUD completo de libros
- ✅ Búsqueda por ISBN con Open Library API
- ✅ Dashboard de estadísticas con gráficos
- ✅ Filtros avanzados
- ✅ Sistema de calificación y reseñas
- ✅ **Diccionario Personal** - Registro de palabras con búsqueda automática de definiciones (Spanish Dictionary API)
- ✅ Diseño responsive
- ✅ Modo oscuro/claro
- ✅ Base de datos PostgreSQL

### Próximas Características
- 📷 Escaneo de códigos de barras con cámara
- 📚 Sistema de préstamos
- 🎯 Metas de lectura anuales
- 📊 Exportación en PDF/CSV
- 🔄 Modo offline con sincronización

## Cómo Usar

### Agregar un Libro
1. Click en "Agregar Libro"
2. Ingresa el ISBN y presiona "Buscar" (opcional)
3. Completa o ajusta la información
4. Selecciona el estado de lectura
5. Guarda el libro

### Ver Estadísticas
1. Navega a "Dashboard"
2. Visualiza métricas del mes y año actual
3. Cambia entre tabs para ver diferentes gráficos
4. Compara libros vs páginas leídas

### Marcar Libro como Terminado
1. Click en la tarjeta del libro
2. Presiona "Editar"
3. Cambia estado a "Terminado"
4. Agrega fechas, calificación y reseña
5. Guarda los cambios

## Comandos de Desarrollo

- `npm run dev` - Inicia servidor de desarrollo
- `npm run db:push` - Sincroniza schema con base de datos
- `npm run build` - Build para producción

## Notas
- Los datos se guardan permanentemente en PostgreSQL
- La búsqueda por ISBN es opcional - todos los campos pueden ingresarse manualmente
- Las páginas siempre pueden editarse manualmente incluso si vienen de la API
- Las estadísticas solo incluyen libros con estado "Terminado"

# Mi Biblioteca Personal

## Descripción General
Aplicación web de gestión de biblioteca personal diseñada específicamente para llevar un control detallado de una colección de libros, progreso de lectura, y estadísticas tanto mensuales como anuales. La aplicación está optimizada para uso en iPhone, tablet y escritorio.

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
Tabla `books`:
- id (UUID)
- title, author, isbn
- pages, coverUrl, genre
- status (por_leer | leyendo | terminado)
- rating (1-5), review
- startDate, finishDate, dateAdded

## API Endpoints

### Libros
- `GET /api/books` - Obtener todos los libros
- `GET /api/books/:id` - Obtener un libro específico
- `POST /api/books` - Crear nuevo libro
- `PATCH /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro

### Estadísticas
- `GET /api/stats` - Dashboard con estadísticas completas

## Diseño Visual

### Tema
- Paleta de colores cálidos inspirada en bibliotecas clásicas
- Tonos marrones y ámbar (#3d2817 principal)
- Soporte completo para modo oscuro/claro
- Tipografía: Playfair Display (serif) + Inter (sans-serif)

### Responsive Design
- Mobile-first approach
- Sidebar colapsable en móvil
- Optimizado para iPhone con meta tags PWA
- Safe area padding para notch/Dynamic Island

## Estado del Proyecto

**Última actualización**: Octubre 2025

### Características Implementadas ✅
- ✅ CRUD completo de libros
- ✅ Búsqueda por ISBN con Open Library API
- ✅ Dashboard de estadísticas con gráficos
- ✅ Filtros avanzados
- ✅ Sistema de calificación y reseñas
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

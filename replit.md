# Biblioteca Moi

## Descripción General
Aplicación web de gestión de biblioteca personal diseñada específicamente para llevar un control detallado de una colección de libros católicos y espirituales, progreso de lectura, y estadísticas tanto mensuales como anuales. La aplicación está optimizada para uso en iPhone, tablet y escritorio con un diseño elegante en turquesa y blanco.

## Características Principales

### Gestión de Libros
- **Catálogo completo** con vista en tarjetas elegantes
- **Escaneo de códigos de barras** con cámara para captura automática de ISBN
  - Usa librería @zxing/library para detección de ISBN-10 e ISBN-13
  - Optimizado para iOS Safari con cámara trasera
  - Búsqueda automática de datos del libro después del escaneo
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
- **Tarjeta de progreso de meta** que muestra avance hacia la meta del año actual

### Filtros y Búsqueda
- Búsqueda por título o autor
- Filtro por estado de lectura
- Filtro por género
- Interfaz responsive optimizada para móvil

### Diccionario Personal
- **Registro manual de palabras** encontradas durante la lectura
- **Ingreso de definiciones personalizadas** en español
- **Asociación opcional** con libros de la biblioteca
- **Notas personales** para contexto adicional
- CRUD completo: crear, editar y eliminar entradas
- Vista en tarjetas elegantes con iconografía

### Lista de Deseos
- **Gestión de wishlist** separada de la biblioteca principal
- **Agregar libros a lista de deseos** directamente desde el formulario de creación
- **Mover libros** de wishlist a biblioteca con un solo click
- **Vista dedicada** con tarjetas elegantes
- **Navegación fácil** con icono de corazón en el sidebar
- Las estadísticas excluyen automáticamente los libros en wishlist

### Metas de Lectura
- **Establecer metas anuales** de lectura (libros o páginas)
- **CRUD completo**: crear, editar y eliminar metas por año
- **Restricción de una meta por año** (garantizada a nivel de base de datos)
- **Visualización de progreso en Dashboard** con barra de progreso visual
- **Indicador de completitud** cuando se alcanza o supera la meta
- **Navegación directa** entre Dashboard y página de Metas

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
- isWishlist (0 = biblioteca, 1 = lista de deseos)

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
- `GET /api/books` - Obtener todos los libros de la biblioteca (isWishlist=0)
- `GET /api/books/:id` - Obtener un libro específico
- `POST /api/books` - Crear nuevo libro (biblioteca o wishlist)
- `PATCH /api/books/:id` - Actualizar libro
- `DELETE /api/books/:id` - Eliminar libro

### Lista de Deseos
- `GET /api/wishlist` - Obtener todos los libros de la wishlist (isWishlist=1)
- `POST /api/wishlist/move-to-library/:id` - Mover libro de wishlist a biblioteca
- `POST /api/library/move-to-wishlist/:id` - Mover libro de biblioteca a wishlist

### Estadísticas
- `GET /api/stats` - Dashboard con estadísticas completas (excluye wishlist)

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
- ✅ **Escaneo de Códigos de Barras** - Captura de ISBN con cámara (optimizado para iOS Safari)
- ✅ Búsqueda por ISBN con Open Library API
- ✅ Dashboard de estadísticas con gráficos
- ✅ Filtros avanzados
- ✅ Sistema de calificación y reseñas
- ✅ **Diccionario Personal** - Registro manual de palabras con definiciones personalizadas
- ✅ **Lista de Deseos** - Gestión de wishlist con mover libros entre wishlist y biblioteca
- ✅ **Metas de Lectura** - Sistema completo de metas anuales con seguimiento de progreso en dashboard
- ✅ Diseño responsive
- ✅ Modo oscuro/claro
- ✅ Base de datos PostgreSQL

### Próximas Características
- 📚 Sistema de préstamos
- 📊 Exportación en PDF/CSV
- 🔄 Modo offline con sincronización
- 📖 Enlaces a autores católicos destacados
- 💡 Sistema de recomendaciones

## Cómo Usar

### Agregar un Libro con Escaneo de Código de Barras
1. Click en "Agregar Libro"
2. Presiona el botón "Escanear" junto al campo ISBN
3. Permite el acceso a la cámara cuando se solicite
4. Apunta la cámara trasera al código de barras del libro
5. El ISBN se capturará automáticamente y se buscarán los datos del libro
6. Completa o ajusta la información adicional
7. Guarda el libro

### Agregar un Libro Manualmente
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

### Usar Lista de Deseos
1. Al agregar un nuevo libro, marca la casilla "Añadir a Lista de Deseos"
2. El libro se guardará en la lista de deseos en lugar de la biblioteca
3. Navega a "Lista de Deseos" en el sidebar para ver tus libros pendientes
4. Click en un libro y presiona "Mover a Biblioteca" cuando lo adquieras
5. El libro se moverá automáticamente a tu biblioteca principal

### Establecer y Ver Metas de Lectura
1. Navega a "Metas" en el sidebar
2. Completa el formulario con el año, tipo (libros o páginas) y objetivo
3. Click en "Crear Meta"
4. Edita o elimina metas existentes usando los botones en las tarjetas
5. Navega al Dashboard para ver tu progreso visual hacia la meta del año actual
6. La tarjeta de progreso muestra cuántos libros/páginas llevas y cuánto te falta

## Comandos de Desarrollo

- `npm run dev` - Inicia servidor de desarrollo
- `npm run db:push` - Sincroniza schema con base de datos
- `npm run build` - Build para producción

## Notas
- Los datos se guardan permanentemente en PostgreSQL
- La búsqueda por ISBN es opcional - todos los campos pueden ingresarse manualmente
- Las páginas siempre pueden editarse manualmente incluso si vienen de la API
- Las estadísticas solo incluyen libros con estado "Terminado" y excluyen libros en wishlist
- Los libros en lista de deseos no aparecen en las estadísticas hasta que se mueven a la biblioteca

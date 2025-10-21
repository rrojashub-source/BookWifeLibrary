# Design Guidelines - Biblioteca Personal

## Design Approach
**Selected Approach:** Hybrid system combining Material Design principles with custom bookish aesthetics inspired by Goodreads and Apple Books

**Key Principles:**
- Warm, inviting library atmosphere with functional data organization
- Mobile-first responsive design optimized for iPhone usage
- Clear information hierarchy for extensive book data and statistics
- Comfortable reading and browsing experience

## Core Design Elements

### A. Color Palette

**Primary Colors (Warm Library Theme):**
- Primary: 25 45% 25% (Deep warm brown - like aged book leather)
- Primary Light: 25 35% 92% (Cream background)
- Secondary: 35 60% 50% (Warm amber accent for highlights)

**Neutral Colors:**
- Text Dark: 25 20% 15% (Dark brown-black for readability)
- Text Light: 25 10% 95% (Off-white for dark mode)
- Background Light: 40 30% 98% (Warm white)
- Background Dark: 25 15% 12% (Deep charcoal with brown undertone)
- Border: 25 15% 85% (Soft warm gray)

**Status Colors:**
- Success (Terminado): 145 60% 45% (Forest green)
- Warning (Leyendo): 35 75% 55% (Amber)
- Info (Por leer): 210 60% 55% (Soft blue)

### B. Typography

**Font Families (Google Fonts):**
- Headings: 'Playfair Display' (serif, elegant for book titles)
- Body: 'Inter' (sans-serif, excellent readability)
- Stats/Numbers: 'Space Grotesk' (monospace feel for data)

**Scale:**
- H1: 2.5rem/font-bold (Dashboard titles)
- H2: 2rem/font-semibold (Section headers)
- H3: 1.5rem/font-semibold (Book titles, cards)
- Body: 1rem/font-normal (General text)
- Small: 0.875rem/font-normal (Metadata, stats)
- Tiny: 0.75rem/font-medium (Labels, badges)

### C. Layout System

**Spacing Units:** Consistent use of 4, 8, 12, 16, 24, 32 (p-1 through p-8)
- Card padding: p-6
- Section spacing: py-12 to py-16
- Component gaps: gap-4 to gap-6

**Grid System:**
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns for cards (md:grid-cols-2)
- Desktop: 3-4 columns for book grid (lg:grid-cols-3 xl:grid-cols-4)

**Container Widths:**
- Main content: max-w-7xl mx-auto
- Forms: max-w-2xl
- Book detail modals: max-w-4xl

### D. Component Library

**Navigation:**
- Bottom tab bar for iPhone (fixed bottom navigation with 4-5 main sections)
- Desktop: Left sidebar with Library, Dashboard, Agregar Libro, Búsqueda
- Icons from Heroicons (book-open, chart-bar, plus-circle, magnifying-glass)

**Book Cards:**
- Vertical card layout with book cover thumbnail (aspect-ratio-[2/3])
- Title (truncate-2-lines), Author, Genre badge
- Progress indicator for "Leyendo" status
- Rating stars (5-star system)
- Soft shadow (shadow-md) with hover lift (hover:shadow-lg)
- Rounded corners (rounded-lg)

**Dashboard Widgets:**
- Stat cards: Large number display with icon and label
- Chart containers: White/dark card backgrounds with rounded-xl
- Monthly/yearly toggle buttons
- Comparison metrics (este mes vs mes anterior)

**Forms:**
- Floating labels for inputs
- Clear field sections with dividers
- Large touch targets for iPhone (min-h-12)
- ISBN scanner button prominently placed
- Image upload with preview
- Dropdowns for Genre, Estado

**Data Visualization:**
- Bar charts for monthly book/page counts (using Chart.js or similar)
- Line graphs for yearly trends
- Color-coded by status
- Tooltips on hover/touch

**Modals & Overlays:**
- Book detail view: Full-screen on mobile, centered modal on desktop
- Smooth slide-up animation on iPhone
- Semi-transparent backdrop (bg-black/50)

### E. Images

**Hero Section:** NOT APPLICABLE (utility app, no marketing hero)

**Book Covers:**
- Placeholder: Warm gradient with book icon when no cover available
- API covers: Display with consistent aspect ratio
- User uploaded: Cropped to standard book dimensions

**Empty States:**
- Illustrated book stack or bookshelf for "No hay libros"
- Friendly, warm illustrations (not cold/corporate)

## Mobile-Specific Considerations

**iPhone Optimization:**
- Add to Home Screen meta tags for app-like experience
- Safe area padding for notch/island (pt-safe pb-safe)
- Sticky headers with backdrop blur
- Large, easy-to-tap buttons (min 44px height)
- Bottom sheet interactions for forms
- Swipe gestures for card actions (delete, edit)
- Pull-to-refresh on book list

**Progressive Web App Features:**
- Offline capability for viewing saved books
- Fast loading with skeleton screens
- Smooth page transitions

## Interaction Patterns

**Micro-interactions:**
- Subtle scale on card press (active:scale-98)
- Smooth color transitions (transition-colors duration-200)
- Loading states with subtle pulse animation for stats
- Success feedback when adding/updating books

**Navigation Flow:**
- Biblioteca (home) → Book Detail → Edit
- Dashboard → Filtrar por mes/año
- Agregar → Manual / Escanear ISBN
- Bottom nav always accessible on mobile

## Accessibility

- Minimum contrast ratio 4.5:1
- Focus visible states for keyboard navigation
- Semantic HTML (proper heading hierarchy)
- Touch targets minimum 44x44px
- Screen reader labels for icons
- Dark mode toggle respecting system preferences
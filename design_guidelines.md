# Design Guidelines - Biblioteca Moi

## Design Approach
**Selected Approach:** Elegant and sophisticated design combining modern aesthetics with Catholic/spiritual elements

**Key Principles:**
- Elegant turquoise and white palette for a refined, calm reading atmosphere
- Mobile-first responsive design optimized for iPhone usage
- Clear information hierarchy for extensive book data and statistics
- Comfortable, inviting experience for spiritual and Catholic literature
- Subtle religious iconography that feels respectful and beautiful

## Core Design Elements

### A. Color Palette

**Primary Colors (Elegant Turquoise Theme):**
- Primary: 185 65% 42% (Deep elegant turquoise - calming and sophisticated)
- Primary Light: 185 45% 88% (Soft turquoise for backgrounds)
- Secondary: 200 55% 60% (Sky blue accent for highlights)
- Accent Gold: 45 85% 55% (Warm gold for special religious elements)

**Neutral Colors:**
- Text Dark: 200 25% 15% (Deep teal-black for readability)
- Text Light: 180 10% 96% (Soft white for dark mode)
- Background Light: 180 30% 98% (Clean white with subtle turquoise tint)
- Background Dark: 195 20% 12% (Deep navy-teal for dark mode)
- Border: 185 20% 85% (Soft turquoise-gray)

**Status Colors:**
- Success (Terminado): 160 60% 45% (Teal green)
- Warning (Leyendo): 45 75% 55% (Warm gold)
- Info (Por leer): 200 60% 55% (Soft blue)

### B. Typography

**Font Families (Google Fonts):**
- Headings: 'Playfair Display' (serif, elegant for book titles)
- Body: 'Inter' (sans-serif, excellent readability)
- Stats/Numbers: 'Space Grotesk' (clean monospace for data)

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
- Left sidebar with elegant turquoise accents
- Biblioteca Moi, Dashboard, Lista de Deseos, Diccionario, Autores Católicos
- Icons from Lucide React (book-open, layout-dashboard, heart, book-marked)

**Book Cards:**
- Vertical card layout with book cover thumbnail (aspect-ratio-[2/3])
- Title (font-serif, truncate-2-lines), Author, Genre badge
- Progress indicator for "Leyendo" status
- Rating stars (5-star system) in gold
- Subtle shadow (shadow-md) with hover lift (hover:shadow-lg)
- Rounded corners (rounded-lg)

**Dashboard Widgets:**
- Stat cards: Large number display with icon and label in turquoise
- Chart containers: White/dark card backgrounds with rounded-xl
- Monthly/yearly toggle buttons
- Comparison metrics and reading goals progress

**Forms:**
- Floating labels for inputs
- Clear field sections with dividers
- Large touch targets for iPhone (min-h-12)
- ISBN scanner button prominently placed
- Image upload with preview
- Dropdowns for Genre, Estado

**Data Visualization:**
- Bar charts for monthly book/page counts (using Recharts)
- Line graphs for yearly trends
- Color-coded by status in turquoise palette
- Tooltips on hover/touch

**Religious Elements:**
- Subtle cross or religious icon in header (optional)
- Gold accents for special features
- Virgen María image placed elegantly in sidebar or header
- Respectful, beautiful presentation

### E. Images

**Religious Imagery:**
- Virgen María Reina de la Paz: Placed in sidebar header or about section
- Subtle, elegant presentation
- Respectful size and placement

**Book Covers:**
- Placeholder: Turquoise gradient with book icon when no cover available
- API covers: Display with consistent aspect ratio
- User uploaded: Cropped to standard book dimensions

**Empty States:**
- Illustrated book stack or bookshelf with turquoise accents
- Friendly, warm illustrations

## Mobile-Specific Considerations

**iPhone Optimization:**
- Add to Home Screen meta tags for PWA experience
- Safe area padding for notch/island (pt-safe pb-safe)
- Sticky headers with backdrop blur
- Large, easy-to-tap buttons (min 44px height)
- Bottom sheet interactions for forms
- Swipe gestures for card actions

**Progressive Web App Features:**
- Offline capability for viewing saved books
- Fast loading with skeleton screens
- Smooth page transitions

## Interaction Patterns

**Micro-interactions:**
- Subtle scale on card press (active:scale-98)
- Smooth color transitions (transition-colors duration-200)
- Loading states with subtle pulse animation
- Success feedback when adding/updating books

**Navigation Flow:**
- Biblioteca (home) → Book Detail → Edit
- Dashboard → View stats, goals, charts
- Lista de Deseos → Add to biblioteca
- Diccionario → Search and save words
- Autores Católicos → Browse authors

## Accessibility

- Minimum contrast ratio 4.5:1
- Focus visible states for keyboard navigation
- Semantic HTML (proper heading hierarchy)
- Touch targets minimum 44x44px
- Screen reader labels for icons
- Dark mode toggle respecting system preferences

## Special Features

**Catholic Literature Focus:**
- Quick filters for Catholic authors and saints
- Author carousel with Catholic writers
- Links to Vatican and religious resources
- Subtle religious iconography throughout

**Personal Touch:**
- Dedicated message from creator
- Custom branding "Biblioteca Moi"
- Gold accents for special achievements
- Warm, loving atmosphere

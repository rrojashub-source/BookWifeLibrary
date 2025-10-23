/**
 * Utilidades para validar URLs de imágenes
 */

/**
 * Verifica si una URL de imagen es válida y accesible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  if (!url || url.trim() === '') {
    return false;
  }

  try {
    // Crear una imagen temporal para verificar si carga
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Timeout de 5 segundos
      const timeout = setTimeout(() => {
        img.src = '';
        resolve(false);
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = url;
    });
  } catch (error) {
    return false;
  }
}

/**
 * Extrae la mejor calidad de imagen de URLs de portadas
 * Algunos servicios ofrecen thumbnails, debemos buscar versiones de alta resolución
 */
export function getBestQualityImageUrl(url: string): string {
  if (!url) return url;
  
  // Google Books: Cambiar zoom=1 a zoom=0 para mejor calidad
  if (url.includes('books.google.com')) {
    return url.replace('zoom=1', 'zoom=0').replace('&edge=curl', '');
  }
  
  // Open Library: Cambiar S/M por L para mejor calidad
  if (url.includes('covers.openlibrary.org')) {
    return url.replace('-S.jpg', '-L.jpg').replace('-M.jpg', '-L.jpg');
  }
  
  // Amazon: intentar obtener versión más grande
  if (url.includes('amazon.com/images')) {
    // Reemplazar tamaños pequeños por grandes
    return url.replace('_SX50_', '_SX500_')
              .replace('_SY75_', '_SY500_')
              .replace('_SS135_', '_SS500_');
  }
  
  return url;
}

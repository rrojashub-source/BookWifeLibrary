/**
 * Utilidades para manejo y validación de ISBN
 */

/**
 * Normaliza un ISBN removiendo guiones, espacios y caracteres no numéricos
 */
export function normalizeISBN(isbn: string): string {
  // Remover todo excepto dígitos y X (para ISBN-10)
  return isbn.replace(/[^0-9X]/gi, '').toUpperCase();
}

/**
 * Valida que un ISBN tenga el formato correcto
 */
export function validateISBN(isbn: string): { valid: boolean; type?: 'ISBN-10' | 'ISBN-13'; error?: string } {
  const normalized = normalizeISBN(isbn);
  
  if (normalized.length === 10) {
    return validateISBN10(normalized);
  } else if (normalized.length === 13) {
    return validateISBN13(normalized);
  } else {
    return {
      valid: false,
      error: 'El ISBN debe tener 10 o 13 dígitos'
    };
  }
}

/**
 * Valida un ISBN-10 usando el algoritmo de checksum
 */
function validateISBN10(isbn: string): { valid: boolean; type?: 'ISBN-10'; error?: string } {
  if (isbn.length !== 10) {
    return { valid: false, error: 'ISBN-10 debe tener exactamente 10 caracteres' };
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(isbn[i]);
    if (isNaN(digit)) {
      return { valid: false, error: 'ISBN-10 contiene caracteres inválidos' };
    }
    sum += digit * (10 - i);
  }

  // El último dígito puede ser X (que representa 10)
  const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
  if (isNaN(checkDigit)) {
    return { valid: false, error: 'Dígito de verificación inválido' };
  }

  sum += checkDigit;

  if (sum % 11 === 0) {
    return { valid: true, type: 'ISBN-10' };
  } else {
    return { valid: false, error: 'Dígito de verificación incorrecto' };
  }
}

/**
 * Valida un ISBN-13 usando el algoritmo de checksum
 */
function validateISBN13(isbn: string): { valid: boolean; type?: 'ISBN-13'; error?: string } {
  if (isbn.length !== 13) {
    return { valid: false, error: 'ISBN-13 debe tener exactamente 13 dígitos' };
  }

  if (!/^\d{13}$/.test(isbn)) {
    return { valid: false, error: 'ISBN-13 debe contener solo dígitos' };
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i]);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  const checkDigit = parseInt(isbn[12]);
  const calculatedCheck = (10 - (sum % 10)) % 10;

  if (checkDigit === calculatedCheck) {
    return { valid: true, type: 'ISBN-13' };
  } else {
    return { valid: false, error: 'Dígito de verificación incorrecto' };
  }
}

/**
 * Convierte un ISBN-10 a ISBN-13
 * Los ISBN-13 usan el prefijo 978 para libros
 */
export function isbn10ToISBN13(isbn10: string): string | null {
  const normalized = normalizeISBN(isbn10);
  
  if (normalized.length !== 10) {
    return null;
  }

  // Añadir prefijo 978
  const base = '978' + normalized.substring(0, 9);
  
  // Calcular nuevo dígito de verificación
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base[i]);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return base + checkDigit;
}

/**
 * Formatea un ISBN con guiones para mejor legibilidad
 * ISBN-10: X-XXX-XXXXX-X
 * ISBN-13: XXX-X-XXX-XXXXX-X
 */
export function formatISBN(isbn: string): string {
  const normalized = normalizeISBN(isbn);
  
  if (normalized.length === 10) {
    // Formato: 0-306-40615-2
    return `${normalized.substring(0, 1)}-${normalized.substring(1, 4)}-${normalized.substring(4, 9)}-${normalized.substring(9, 10)}`;
  } else if (normalized.length === 13) {
    // Formato: 978-0-306-40615-7
    return `${normalized.substring(0, 3)}-${normalized.substring(3, 4)}-${normalized.substring(4, 7)}-${normalized.substring(7, 12)}-${normalized.substring(12, 13)}`;
  }
  
  return isbn; // Retornar original si no es válido
}

/**
 * Obtiene todas las variantes de un ISBN (con/sin guiones, ISBN-10/13)
 */
export function getISBNVariants(isbn: string): string[] {
  const normalized = normalizeISBN(isbn);
  const variants: string[] = [normalized];
  
  // Añadir versión formateada
  const formatted = formatISBN(normalized);
  if (formatted !== normalized) {
    variants.push(formatted);
  }
  
  // Si es ISBN-10, añadir versión ISBN-13
  if (normalized.length === 10) {
    const isbn13 = isbn10ToISBN13(normalized);
    if (isbn13) {
      variants.push(isbn13);
      variants.push(formatISBN(isbn13));
    }
  }
  
  return variants;
}

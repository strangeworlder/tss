import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML input to prevent XSS attacks
 * @param input The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeInput(input: string): string {
  const config = {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
    ],
    ALLOWED_ATTR: ['class'],
  };
  // Use type assertion to tell TypeScript this is valid
  return DOMPurify.sanitize(input, config as Record<string, unknown>);
}

/**
 * Sanitizes a URL to prevent XSS and injection attacks
 * @param url The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitizes an object by removing any script tags or dangerous HTML from string values
 * @param obj The object to sanitize
 * @returns A new object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj } as T;
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }
  return sanitized;
}

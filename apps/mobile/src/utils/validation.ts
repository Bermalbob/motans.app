/**
 * MOTANS - Módulo de Validación y Sanitización
 * 
 * Funciones utilitarias para validar y limpiar datos de entrada del usuario.
 * Importante para seguridad y consistencia de datos.
 */

// ─────────────────────────────────────────────────────────────
// SANITIZACIÓN
// ─────────────────────────────────────────────────────────────

/**
 * Elimina espacios extra y caracteres problemáticos de texto
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  
  return input
    .trim()
    .replace(/\s+/g, " ") // Múltiples espacios -> uno solo
    .replace(/[<>]/g, "") // Prevenir XSS básico
    .substring(0, 10000); // Límite de longitud
}

/**
 * Sanitiza email
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== "string") return "";
  
  return input
    .trim()
    .toLowerCase()
    .replace(/\s/g, "")
    .substring(0, 254); // RFC 5321 max
}

/**
 * Sanitiza teléfono (solo números y +)
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== "string") return "";
  
  return input
    .replace(/[^\d+]/g, "")
    .substring(0, 20);
}

/**
 * Sanitiza nombre de usuario/display name
 */
export function sanitizeName(input: string): string {
  if (!input || typeof input !== "string") return "";
  
  return input
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/g, "") // Solo letras, espacios, guiones, apóstrofes
    .substring(0, 100);
}

/**
 * Sanitiza URL
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== "string") return "";
  
  const trimmed = input.trim();
  
  // Verificar que empiece con http:// o https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return "";
  }
  
  return trimmed.substring(0, 2048);
}

/**
 * Sanitiza número (precio, cantidad, etc.)
 */
export function sanitizeNumber(input: string | number): number | null {
  if (input === null || input === undefined) return null;
  
  const num = typeof input === "string" 
    ? parseFloat(input.replace(/[^\d.-]/g, ""))
    : input;
    
  if (isNaN(num) || !isFinite(num)) return null;
  
  return num;
}

// ─────────────────────────────────────────────────────────────
// VALIDACIÓN
// ─────────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.length === 0) {
    return { isValid: false, error: "El email es requerido" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Email inválido" };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: "Email demasiado largo" };
  }
  
  return { isValid: true };
}

/**
 * Valida contraseña
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: "La contraseña es requerida" };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: "Mínimo 8 caracteres" };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: "Máximo 128 caracteres" };
  }
  
  // Al menos una letra y un número
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return { isValid: false, error: "Debe incluir letras y números" };
  }
  
  return { isValid: true };
}

/**
 * Valida teléfono español
 */
export function validateSpanishPhone(phone: string): ValidationResult {
  if (!phone || phone.length === 0) {
    return { isValid: false, error: "El teléfono es requerido" };
  }
  
  // Limpiar formato
  const cleaned = phone.replace(/\D/g, "");
  
  // Teléfono español: 9 dígitos empezando por 6, 7, 8 o 9
  // O con prefijo +34
  if (cleaned.length === 9 && /^[6789]\d{8}$/.test(cleaned)) {
    return { isValid: true };
  }
  
  if (cleaned.length === 11 && /^34[6789]\d{8}$/.test(cleaned)) {
    return { isValid: true };
  }
  
  return { isValid: false, error: "Teléfono español inválido" };
}

/**
 * Valida nombre
 */
export function validateName(name: string, minLength = 2, maxLength = 100): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "El nombre es requerido" };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < minLength) {
    return { isValid: false, error: `Mínimo ${minLength} caracteres` };
  }
  
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `Máximo ${maxLength} caracteres` };
  }
  
  return { isValid: true };
}

/**
 * Valida precio
 */
export function validatePrice(price: number | null, min = 0, max = 999999999): ValidationResult {
  if (price === null || price === undefined) {
    return { isValid: false, error: "El precio es requerido" };
  }
  
  if (isNaN(price) || !isFinite(price)) {
    return { isValid: false, error: "Precio inválido" };
  }
  
  if (price < min) {
    return { isValid: false, error: `Mínimo ${min}€` };
  }
  
  if (price > max) {
    return { isValid: false, error: `Máximo ${max}€` };
  }
  
  return { isValid: true };
}

/**
 * Valida URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.length === 0) {
    return { isValid: true }; // URL es opcional normalmente
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "URL inválida" };
  }
}

/**
 * Valida CIF/NIF español
 */
export function validateSpanishId(id: string): ValidationResult {
  if (!id || id.length === 0) {
    return { isValid: false, error: "El NIF/CIF es requerido" };
  }
  
  const cleaned = id.toUpperCase().replace(/[\s-]/g, "");
  
  // NIF: 8 dígitos + letra
  // NIE: X/Y/Z + 7 dígitos + letra  
  // CIF: Letra + 7 dígitos + letra/dígito
  
  const nifRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[A-Z0-9]$/;
  
  if (nifRegex.test(cleaned) || nieRegex.test(cleaned) || cifRegex.test(cleaned)) {
    return { isValid: true };
  }
  
  return { isValid: false, error: "NIF/CIF inválido" };
}

/**
 * Valida código postal español
 */
export function validateSpanishPostalCode(code: string): ValidationResult {
  if (!code || code.length === 0) {
    return { isValid: false, error: "El código postal es requerido" };
  }
  
  const cleaned = code.replace(/\s/g, "");
  
  // Código postal español: 5 dígitos, empezando por 01-52
  if (/^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/.test(cleaned)) {
    return { isValid: true };
  }
  
  return { isValid: false, error: "Código postal español inválido" };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Valida múltiples campos y retorna errores
 */
export function validateForm(validations: Record<string, ValidationResult>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  for (const [field, result] of Object.entries(validations)) {
    if (!result.isValid && result.error) {
      errors[field] = result.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
}

/**
 * Formatea teléfono para mostrar
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith("34")) {
    return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
}

/**
 * Formatea precio
 */
export function formatPrice(price: number, currency = "€"): string {
  return `${price.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export default {
  // Sanitización
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeName,
  sanitizeUrl,
  sanitizeNumber,
  // Validación
  validateEmail,
  validatePassword,
  validateSpanishPhone,
  validateName,
  validatePrice,
  validateUrl,
  validateSpanishId,
  validateSpanishPostalCode,
  validateForm,
  // Formateo
  formatPhone,
  formatPrice,
};

// Utilidades para validación de comentarios

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateComment = (content: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar longitud mínima
  if (content.trim().length < 3) {
    errors.push("El comentario debe tener al menos 3 caracteres");
  }

  // Validar longitud máxima
  if (content.length > 2000) {
    errors.push("El comentario no puede exceder los 2000 caracteres");
  }

  // Validar contenido vacío o solo espacios
  if (!content.trim()) {
    errors.push("El comentario no puede estar vacío");
  }

  // Detectar spam potencial (repetición de caracteres)
  const repeatedChars = /(.)\1{10,}/g;
  if (repeatedChars.test(content)) {
    warnings.push(
      "El comentario contiene repeticiones excesivas de caracteres"
    );
  }

  // Detectar posible spam (mayúsculas excesivas)
  const upperCaseRatio =
    (content.match(/[A-Z]/g) || []).length / content.length;
  if (upperCaseRatio > 0.7 && content.length > 20) {
    warnings.push("Evita usar tantas mayúsculas");
  }

  // Detectar enlaces sospechosos
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlPattern);
  if (urls && urls.length > 2) {
    warnings.push("Tu comentario contiene muchos enlaces");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const sanitizeComment = (content: string): string => {
  // Limpiar espacios en blanco excesivos
  return content
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
};

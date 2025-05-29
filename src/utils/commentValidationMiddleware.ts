// Middleware avanzado de validación para comentarios con reglas configurables
import { validateComment, sanitizeComment } from "./commentValidation";

export interface CommentValidationConfig {
  minLength: number;
  maxLength: number;
  allowHtml: boolean;
  enableSpamDetection: boolean;
  bannedWords: string[];
  rateLimitPerMinute: number;
}

export const defaultValidationConfig: CommentValidationConfig = {
  minLength: 3,
  maxLength: 2000,
  allowHtml: false,
  enableSpamDetection: true,
  bannedWords: ["spam", "fake", "bot"],
  rateLimitPerMinute: 5,
};

class CommentValidationMiddleware {
  private config: CommentValidationConfig;
  private userCommentHistory: Map<string, number[]> = new Map();

  constructor(config: CommentValidationConfig = defaultValidationConfig) {
    this.config = config;
  }

  // Validación completa de comentario
  validateCommentContent(
    content: string,
    userId?: string
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedContent: string;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Sanitizar contenido
    const sanitizedContent = sanitizeComment(content);

    // Validación básica
    const basicValidation = validateComment(content);
    errors.push(...basicValidation.errors);
    warnings.push(...basicValidation.warnings);

    // Validación de longitud personalizada
    if (sanitizedContent.length < this.config.minLength) {
      errors.push(
        `El comentario debe tener al menos ${this.config.minLength} caracteres`
      );
    }

    if (sanitizedContent.length > this.config.maxLength) {
      errors.push(
        `El comentario no puede exceder ${this.config.maxLength} caracteres`
      );
    }

    // Detección de palabras prohibidas
    if (this.config.bannedWords.length > 0) {
      const lowerContent = sanitizedContent.toLowerCase();
      const foundBannedWords = this.config.bannedWords.filter((word) =>
        lowerContent.includes(word.toLowerCase())
      );

      if (foundBannedWords.length > 0) {
        errors.push(
          `El comentario contiene palabras no permitidas: ${foundBannedWords.join(
            ", "
          )}`
        );
      }
    }

    // Rate limiting por usuario
    if (userId && this.isRateLimited(userId)) {
      errors.push(
        `Has alcanzado el límite de ${this.config.rateLimitPerMinute} comentarios por minuto`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedContent,
    };
  }

  // Verificar rate limiting
  private isRateLimited(userId: string): boolean {
    const now = Date.now();
    const userHistory = this.userCommentHistory.get(userId) || [];

    // Filtrar comentarios del último minuto
    const recentComments = userHistory.filter(
      (timestamp) => now - timestamp < 60000 // 60 segundos
    );

    // Actualizar historial
    this.userCommentHistory.set(userId, [...recentComments, now]);

    return recentComments.length >= this.config.rateLimitPerMinute;
  }

  // Validar permisos de usuario
  validateUserPermissions(
    userId: string,
    action: "create" | "edit" | "delete",
    targetCommentUserId?: string
  ): {
    isAllowed: boolean;
    reason?: string;
  } {
    switch (action) {
      case "create":
        return { isAllowed: true };

      case "edit":
      case "delete":
        if (!targetCommentUserId) {
          return {
            isAllowed: false,
            reason: "ID de comentario objetivo no especificado",
          };
        }

        if (userId !== targetCommentUserId) {
          return {
            isAllowed: false,
            reason: "Solo puedes modificar tus propios comentarios",
          };
        }

        return { isAllowed: true };

      default:
        return { isAllowed: false, reason: "Acción no válida" };
    }
  }

  // Limpiar historial antiguo (llamar periódicamente)
  cleanupOldHistory(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hora

    for (const [userId, timestamps] of this.userCommentHistory.entries()) {
      const recentTimestamps = timestamps.filter(
        (timestamp) => timestamp > oneHourAgo
      );

      if (recentTimestamps.length === 0) {
        this.userCommentHistory.delete(userId);
      } else {
        this.userCommentHistory.set(userId, recentTimestamps);
      }
    }
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<CommentValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Obtener estadísticas de validación
  getValidationStats(): {
    totalUsers: number;
    activeUsers: number;
    averageCommentsPerUser: number;
  } {
    const totalUsers = this.userCommentHistory.size;
    const now = Date.now();
    const fiveMinutesAgo = now - 300000; // 5 minutos

    let activeUsers = 0;
    let totalRecentComments = 0;

    for (const timestamps of this.userCommentHistory.values()) {
      const recentComments = timestamps.filter(
        (timestamp) => timestamp > fiveMinutesAgo
      );
      if (recentComments.length > 0) {
        activeUsers++;
        totalRecentComments += recentComments.length;
      }
    }

    return {
      totalUsers,
      activeUsers,
      averageCommentsPerUser:
        activeUsers > 0 ? totalRecentComments / activeUsers : 0,
    };
  }
}

// Singleton instance
export const commentValidationMiddleware = new CommentValidationMiddleware();

// Hook para usar el middleware en componentes React
export const useCommentValidation = (
  config?: Partial<CommentValidationConfig>
) => {
  if (config) {
    commentValidationMiddleware.updateConfig(config);
  }

  return {
    validateComment: (content: string, userId?: string) =>
      commentValidationMiddleware.validateCommentContent(content, userId),

    validatePermissions: (
      userId: string,
      action: "create" | "edit" | "delete",
      targetCommentUserId?: string
    ) =>
      commentValidationMiddleware.validateUserPermissions(
        userId,
        action,
        targetCommentUserId
      ),

    getStats: () => commentValidationMiddleware.getValidationStats(),
  };
};

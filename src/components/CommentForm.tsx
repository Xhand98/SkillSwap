// Componente de formulario para crear/editar comentarios
import React, { useState, useEffect } from "react";
import {
  validateComment,
  sanitizeComment,
  ValidationResult,
} from "@/utils/commentValidation";

interface CommentFormProps {
  onSubmit: (contenido: string) => void;
  onCancel?: () => void;
  initialValue?: string;
  placeholder?: string;
  submitText?: string;
  cancelText?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  initialValue = "",
  placeholder = "Escribe tu comentario...",
  submitText = "Comentar",
  cancelText = "Cancelar",
}) => {
  const [contenido, setContenido] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [showValidation, setShowValidation] = useState(false);

  // Validar contenido en tiempo real
  useEffect(() => {
    if (contenido.trim().length > 0) {
      const result = validateComment(contenido);
      setValidationResult(result);
      setShowValidation(true);
    } else {
      setShowValidation(false);
    }
  }, [contenido]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedContent = sanitizeComment(contenido);
    const validation = validateComment(sanitizedContent);

    if (!validation.isValid) {
      setValidationResult(validation);
      setShowValidation(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(sanitizedContent);
      setContenido(""); // Limpiar formulario después de enviar
      setShowValidation(false);
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      alert("Error al enviar el comentario. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    setContenido(initialValue);
    setShowValidation(false);
    if (onCancel) {
      onCancel();
    }
  };

  const charactersLeft = 2000 - contenido.length;
  const isNearLimit = charactersLeft < 200;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        {" "}
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:border-transparent ${
            showValidation && !validationResult.isValid
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          rows={4}
          maxLength={2000}
          disabled={isSubmitting}
        />
        {/* Mostrar errores de validación */}
        {showValidation && validationResult.errors.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            {validationResult.errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}
        {/* Mostrar advertencias */}
        {showValidation && validationResult.warnings.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            {validationResult.warnings.map((warning, index) => (
              <p key={index} className="text-sm text-yellow-600">
                {warning}
              </p>
            ))}
          </div>
        )}
        {/* Contador de caracteres */}
        <div
          className={`text-sm mt-1 ${
            isNearLimit ? "text-red-500" : "text-gray-500"
          }`}
        >
          {charactersLeft} caracteres restantes
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          {" "}
          <button
            type="submit"
            disabled={
              isSubmitting || !validationResult.isValid || !contenido.trim()
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Enviando..." : submitText}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
          )}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500">Puedes usar texto plano</div>
      </div>
    </form>
  );
};

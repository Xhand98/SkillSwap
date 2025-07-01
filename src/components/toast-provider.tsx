"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, AlertCircle, Database } from "lucide-react";

export interface ToastType {
  id: string;
  type: "success" | "error" | "info" | "database";
  title: string;
  message: string;
  duration?: number;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastType, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

import React from "react";

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (toast: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration (default 5 seconds)
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getIcon = (type: ToastType["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <XCircle className="h-5 w-5" />;
      case "database":
        return <Database className="h-5 w-5" />;
      case "info":
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getColorClasses = (type: ToastType["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-700 text-green-100";
      case "error":
        return "bg-red-900/90 border-red-700 text-red-100";
      case "database":
        return "bg-blue-900/90 border-blue-700 text-blue-100";
      case "info":
      default:
        return "bg-gray-900/90 border-gray-700 text-gray-100";
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              min-w-80 max-w-md p-4 rounded-lg border backdrop-blur-sm
              transform transition-all duration-300 ease-in-out
              ${getColorClasses(toast.type)}
              animate-in slide-in-from-top-2
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
              <div className="flex-1">
                <h4 className="font-semibold">{toast.title}</h4>
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Helper functions for common toast types
export const showDatabaseToast = (addToast: ToastContextType["addToast"]) => ({
  success: (message: string) =>
    addToast({
      type: "database",
      title: "Base de Datos",
      message: `✅ ${message}`,
      duration: 3000,
    }),
  error: (message: string) =>
    addToast({
      type: "error",
      title: "Error de Base de Datos",
      message: `❌ ${message}`,
      duration: 5000,
    }),
  loading: (message: string) =>
    addToast({
      type: "info",
      title: "Base de Datos",
      message: `🔄 ${message}`,
      duration: 2000,
    }),
});

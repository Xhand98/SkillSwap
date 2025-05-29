"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { ToastMessage } from "@/components/Toast";

interface ToastState {
  toasts: ToastMessage[];
}

type ToastAction =
  | { type: "ADD_TOAST"; payload: ToastMessage }
  | { type: "REMOVE_TOAST"; payload: string }
  | { type: "CLEAR_ALL_TOASTS" };

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (
    type: ToastMessage["type"],
    title: string,
    message: string,
    duration?: number
  ) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, duration?: number) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };
    case "CLEAR_ALL_TOASTS":
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const addToast = (
    type: ToastMessage["type"],
    title: string,
    message: string,
    duration?: number
  ): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration: duration || 5000,
    };

    dispatch({ type: "ADD_TOAST", payload: newToast });
    return id;
  };

  const removeToast = (id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: id });
  };

  const clearAllToasts = () => {
    dispatch({ type: "CLEAR_ALL_TOASTS" });
  };

  const showSuccess = (title: string, message: string, duration?: number) => {
    return addToast("success", title, message, duration);
  };

  const showError = (title: string, message: string, duration?: number) => {
    return addToast("error", title, message, duration);
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    return addToast("warning", title, message, duration);
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    return addToast("info", title, message, duration);
  };

  const value: ToastContextType = {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

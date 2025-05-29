// Proveedor global de notificaciones que integra múltiples sistemas
import React from "react";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/ToastContainer";
import { Toaster } from "@/components/ui/toaster";

interface GlobalToastProviderProps {
  children: React.ReactNode;
}

export const GlobalToastProvider: React.FC<GlobalToastProviderProps> = ({
  children,
}) => {
  return (
    <ToastProvider>
      {children}
      {/* Contenedor de notificaciones personalizado */}
      <ToastContainer />
      {/* Toaster de shadcn/ui para compatibilidad */}
      <Toaster />
    </ToastProvider>
  );
};

export default GlobalToastProvider;

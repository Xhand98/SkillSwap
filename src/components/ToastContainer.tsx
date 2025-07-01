"use client";

import React from "react";
import Toast, { ToastMessage } from "./Toast";
import { useToastContext } from "@/contexts/ToastContext";

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;

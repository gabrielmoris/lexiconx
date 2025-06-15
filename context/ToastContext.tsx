"use client";

import { Toast, ToastProps } from "@/components/Layout/Toast";
import React, { createContext, useState, useContext } from "react";

interface ToastParams extends ToastProps {
  duration: number;
}

interface UiContextType {
  showToast: (params: ToastParams) => void;
}

const ToastContext = createContext<UiContextType>({
  showToast: () => null,
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastParams | null>(null);

  const showToast = (params: ToastParams) => {
    setToast(params);
    setTimeout(() => {
      setToast(null);
    }, params.duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
};

export const useToastContext: () => UiContextType = () => useContext(ToastContext);

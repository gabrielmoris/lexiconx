import React from "react";
import classes from "./toast.module.css";

export interface ToastProps {
  message: string;
  variant: "success" | "error" | "warning" | "info";
  duration: number;
}

/**
 * Toast notification component
 */
export const Toast = ({ message, variant, duration }: ToastProps) => {
  const toastRef = React.useRef<HTMLDivElement>(null);

  // animate component popping in and out on duration
  React.useEffect(() => {
    if (toastRef.current) {
      toastRef.current.classList.add(classes["animate-toast-in"]);
      setTimeout(() => {
        if (toastRef.current) {
          toastRef.current.classList.remove(classes["animate-toast-in"]);
          toastRef.current.classList.add(classes["animate-toast-out"]);
        }
      }, duration - 500);
    }
  }, [duration]);

  return (
    <div
      className={`font-bold ${
        variant === "success"
          ? "bg-blue-100 border-info text-info"
          : variant === "error"
          ? "bg-red-100 border-error text-error"
          : variant === "warning"
          ? "bg-yellow-50 border-warning text-warning "
          : "bg-secondary dark:bg-theme-fg-dark border-theme-text-light dark:border-theme-text-dark text-theme-text-light dark:text-theme-text-dark"
      } fixed left-1/2 top-5 transform -translate-x-1/2 border-2 p-4 rounded-md z-50`}
      role="alert"
      ref={toastRef}
    >
      <p>{message}</p>
    </div>
  );
};

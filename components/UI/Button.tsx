import React from "react";

interface ButonProps {
  className?: string;
  onClick?: () => void;
  type?: "submit" | "button";
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  disabled?: boolean;
}

const Button = ({ disabled, className, onClick, type = "submit", variant = "primary", children }: ButonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full cursor-pointer p-2 ${
        variant === "primary" ? "bg-secondary dark:bg-gray-800 text-white" : "border border-secondary  text-secondary"
      } rounded disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-sm hover:opacity-90 ${className}`}
      onClick={onClick}
      aria-busy={disabled}
    >
      {children}
    </button>
  );
};

export default Button;

import { ButtonHTMLAttributes, ReactNode, LabelHTMLAttributes } from "react";

type ButtonVariant = "primary" | "danger" | "secondary" | "ghost";

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: "button";
  variant?: ButtonVariant;
  children: ReactNode;
};

type ButtonAsLabel = LabelHTMLAttributes<HTMLLabelElement> & {
  as: "label";
  variant?: ButtonVariant;
  children: ReactNode;
};

type ButtonProps = ButtonAsButton | ButtonAsLabel;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/20",
  danger: "bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-medium",
  secondary: "bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-200 font-medium",
  ghost: "bg-white/10 hover:bg-white/20 border border-slate-700 text-slate-200",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  as = "button",
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg transition-all inline-block";
  const disabledStyles = "disabled" in props && props.disabled ? "opacity-50 cursor-not-allowed" : "";

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`;

  if (as === "label") {
    return (
      <label
        className={combinedClassName}
        {...(props as LabelHTMLAttributes<HTMLLabelElement>)}
      >
        {children}
      </label>
    );
  }

  return (
    <button
      className={combinedClassName}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

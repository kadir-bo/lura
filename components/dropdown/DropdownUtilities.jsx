import { useDropdown } from "@/context";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

const itemClassName =
  "w-full px-2.5 py-2 text-left text-sm text-text-secondary transition-colors duration-75 flex items-center gap-2 rounded-md cursor-pointer outline-none hover:bg-interactive-hover";

export function DropdownItem({
  children,
  className = "",
  href,
  onClick,
  ...props
}) {
  const { setIsOpen } = useDropdown();

  const handleClose = (e) => {
    setIsOpen(false);
    onClick?.(e);
  };

  if (href) {
    return (
      <Link
        href={href}
        onClick={handleClose}
        className={twMerge(itemClassName, className)}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={handleClose}
      className={twMerge(itemClassName, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator({ className = "" }) {
  return (
    <div
      className={twMerge("h-px my-1 bg-border", className)}
    />
  );
}

export function DropdownLabel({ children, className = "" }) {
  return (
    <div
      className={twMerge(
        "px-2.5 py-1.5 text-xs font-medium uppercase tracking-widest truncate text-text-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

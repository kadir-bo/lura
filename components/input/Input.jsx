import { Lock } from "react-feather";
import { twMerge } from "tailwind-merge";
import { Icon } from "@/components";

export default function Input({
  id = "",
  name = "",
  type = "text",
  label = "label",
  value = "",
  placeholder = "",
  autoComplete = "off",
  autoFocus = false,
  disabled = false,
  locked = false,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  required = false,
  onChange = () => null,
  onKeyDown = () => null,
  onBlur = () => null,
  onFocus = () => null,
  ...props
}) {
  const lockedClasses = locked && "opacity-50 cursor-not-allowed";

  return (
    <div
      className={twMerge(
        "w-full min-w-40 relative",
        containerClassName,
        lockedClasses,
      )}
    >
      <label
        htmlFor={id}
        className={twMerge(
          "mb-1.5 text-sm ml-px flex gap-1 items-center justify-start pl-px",
          labelClassName,
          lockedClasses,
        )}
        style={{ color: "var(--text-2)" }}
      >
        {label}
        {locked && (
          <Icon name={Lock} size="xs" style={{ color: "var(--text-3)" }} />
        )}
      </label>
      <input
        type={type}
        name={name || id}
        id={id}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        required={required}
        className={twMerge(
          "border w-full px-3 py-2.5 rounded-lg bg-transparent outline-none",
          "transition-colors duration-100",
          "focus:border-(--border-hi)",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "placeholder:text-(--text-3)",
          inputClassName,
          lockedClasses,
        )}
        style={{
          borderColor: "var(--border-med)",
          color: "var(--text-1)",
        }}
        {...props}
      />
    </div>
  );
}

import { Lock } from "react-feather";
import { twMerge } from "tailwind-merge";
import { PrimaryButton, DropdownMenu, Icon } from "@/components";

export default function Select({
  id = "",
  name = "",
  label = "label",
  value = "",
  list = [],
  disabled = false,
  locked = false,
  containerClassName = "",
  labelClassName = "",
  buttonClassName = "",
  onChange = () => null,
  onBlur = () => null,
  onFocus = () => null,
}) {
  const lockedCls = locked ? "opacity-50 cursor-not-allowed" : "";

  const handleSelect = (e, menuItem) => {
    onChange({
      target: { name: name || id, value: menuItem.value || menuItem.id },
    });
  };

  return (
    <div className={twMerge("w-full min-w-40 relative", containerClassName, lockedCls)}>
      <label
        htmlFor={id}
        className={twMerge("mb-1.5 text-sm ml-px flex gap-1 items-center pl-px text-text-secondary", labelClassName, lockedCls)}
      >
        {label}
        {locked && <Icon name={Lock} size="xs" className="text-text-muted" />}
      </label>

      {list.length > 0 && (
        <DropdownMenu
          dropdownList={list}
          onClick={handleSelect}
          triggerClassName="w-full"
          contentSide="bottom"
        >
          <PrimaryButton
            className={twMerge(
              "border border-border-med w-full px-3 py-2.5 rounded-lg bg-transparent text-text-primary outline-none justify-between text-left",
              !value && "opacity-60",
              buttonClassName,
              lockedCls,
            )}
            disabled={locked || disabled}
            aria-label={label}
            onBlur={onBlur}
            onFocus={onFocus}
          >
            {value || "Select an option"}
          </PrimaryButton>
        </DropdownMenu>
      )}
    </div>
  );
}

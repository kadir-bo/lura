"use client";

import React, { useState, useCallback } from "react";
import { Search, X } from "react-feather";
import { twMerge } from "tailwind-merge";
import { Icon } from "@/components";

export default function Searchbar({
  placeholder = "Search",
  onSearch,
  className = "",
  ...props
}) {
  const [query, setQuery] = useState("");

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setQuery(value);
      onSearch?.(value);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch?.("");
  }, [onSearch]);

  return (
    <div
      className={twMerge(
        "w-full flex items-center rounded-xl overflow-hidden transition-colors duration-150",
        "border",
        className,
      )}
      style={{
        borderColor: query ? "var(--border-hi)" : "var(--border-med)",
        background: "var(--elevated)",
        color: query ? "var(--text-1)" : "var(--text-2)",
      }}
      {...props}
    >
      <span
        className="flex items-center justify-center pl-3 shrink-0"
        style={{ color: "var(--text-3)" }}
      >
        <Icon name={Search} size="sm" />
      </span>

      <input
        type="text"
        name="query"
        id="query"
        placeholder={placeholder}
        className="w-full px-3 py-1.5 outline-none bg-transparent placeholder:text-(--text-3)"
        style={{ color: "var(--text-1)" }}
        onChange={handleChange}
        value={query}
        autoComplete="off"
      />

      {query && (
        <button
          onClick={handleClear}
          className="flex items-center justify-center pr-3 shrink-0 transition-colors hover:text-foreground"
          style={{ color: "var(--text-3)" }}
          type="button"
          aria-label="Clear search"
        >
          <Icon name={X} size="sm" />
        </button>
      )}
    </div>
  );
}

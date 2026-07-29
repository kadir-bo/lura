import { Searchbar, Select, SelectionStatus } from "@/components";
import { FILTER_OPTIONS } from "@/lib";

export default function ChatPageShell({
  tabs,
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearch,
  searchPlaceholder,
  selectedCount,
  hasItems,
  itemType,
  actions,
  primaryAction,
  pageTitle,
  clearSelection = () => null,
  children,
}) {
  const activeSort = FILTER_OPTIONS.find((o) => o.value === sortBy);

  return (
    <div className="flex-1 flex flex-col py-8 gap-5 w-full px-6 wrapper">
      {/* Optional page title (for pages with multi-tab sub-navigation) */}
      {pageTitle && (
        <h1
          className="text-xl font-semibold -mb-3 text-text-primary"
        >
          {pageTitle}
        </h1>
      )}

      {/* Page header: tabs + sort + primary action */}
      {tabs && (
        <div
          className="flex items-end justify-between border-b border-border"
        >
          <div className="flex items-center gap-1">
            {tabs.map(({ key, label, count }) =>
              tabs.length === 1 ? (
                <span
                  key={key}
                  className="px-1 pb-2.5 text-xl font-semibold border-b-2 -mb-px border-text-primary text-text-primary"
                >
                  {label}
                </span>
              ) : (
                <button
                  key={key}
                  onClick={() => onTabChange(key)}
                  className={`px-4 py-2 text-sm capitalize transition-colors duration-150 border-b-2 -mb-px outline-none ${activeTab === key ? "border-text-primary text-text-primary" : "border-transparent text-text-secondary"}`}
                >
                  {label}
                  <span
                    className="ml-2 text-xs text-text-muted"
                  >
                    {count}
                  </span>
                </button>
              ),
            )}
          </div>

          {/* Sort + primary action aligned with tab bar */}
          <div className="flex items-center gap-2 pb-2">
            <Select
              id="sort"
              name="sort"
              label=""
              value={activeSort?.label || "Sort by"}
              list={FILTER_OPTIONS}
              onChange={(e) => onSortChange(e.target.value)}
              containerClassName="w-max min-w-20"
              labelClassName="hidden"
              buttonClassName="text-sm px-3 w-max justify-center font-normal"
            />
            {primaryAction}
          </div>
        </div>
      )}

      {/* Toolbar: full-width searchbar + selection actions */}
      <div className="flex items-center gap-3">
        <Searchbar
          key={activeTab}
          onSearch={onSearch}
          placeholder={searchPlaceholder}
          className="flex-1"
        />
        {hasItems && selectedCount > 0 && (
          <SelectionStatus
            selectedCount={selectedCount}
            itemType={itemType}
            hasItems={hasItems}
            onCancel={clearSelection}
          />
        )}
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      {children}
    </div>
  );
}

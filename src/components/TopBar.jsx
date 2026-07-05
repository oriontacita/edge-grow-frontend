export default function TopBar({
  onMenuClick,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  breadcrumb,
}) {
  return (
    <header className="sticky top-0 w-full h-16 bg-surface shadow-sm flex justify-between items-center px-4 md:px-8 z-30">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          aria-label="Buka menu"
          className="md:hidden text-on-surface-variant p-2"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {breadcrumb ? (
          <div className="hidden md:flex items-center gap-2 text-on-surface-variant text-sm">
            {breadcrumb}
          </div>
        ) : onSearchChange ? (
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
              placeholder={searchPlaceholder}
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-4">
        <button
          aria-label="Notifikasi"
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-all relative"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  )
}

import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppShell({
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  breadcrumb,
  contentClassName = 'p-4 md:p-8 max-w-[1600px] mx-auto w-full',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          breadcrumb={breadcrumb}
        />
        <main className={contentClassName}>{children}</main>
      </div>
    </div>
  )
}

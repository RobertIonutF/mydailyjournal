'use client'

import { useState } from 'react'
import { Menu, LayoutDashboard, BookOpen, Activity } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <aside className={`min-h-screen border-r bg-muted transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen && <h1 className="text-2xl font-bold text-primary">Dashboard</h1>}
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex-1">
        <Link href="/">
          <Button
            variant={pathname === '/' ? 'secondary' : 'ghost'}
            className={`w-full justify-start mb-2 ${sidebarOpen ? 'px-4' : 'px-2'}`}
          >
            <LayoutDashboard className="h-5 w-5 mr-2" />
            {sidebarOpen && 'Overview'}
          </Button>
        </Link>
        <Link href="/thoughts">
          <Button
            variant={pathname === '/thoughts' ? 'secondary' : 'ghost'}
            className={`w-full justify-start mb-2 ${sidebarOpen ? 'px-4' : 'px-2'}`}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            {sidebarOpen && 'Thoughts'}
          </Button>
        </Link>
        <Link href="/activity">
          <Button
            variant={pathname === '/activity' ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${sidebarOpen ? 'px-4' : 'px-2'}`}
          >
            <Activity className="h-5 w-5 mr-2" />
            {sidebarOpen && 'Activities'}
          </Button>
        </Link>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          {sidebarOpen && <span className="text-sm font-medium">Theme</span>}
          <ModeToggle />
        </div>
      </div>
    </aside>
  )
} 
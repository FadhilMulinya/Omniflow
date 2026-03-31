'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard,
  Bot,
  Box,
  Settings,
  Store,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/overlays/sheet';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Home',        href: '/',                  icon: Home,            section: 'top'    },
  { name: 'Dashboard',   href: '/dashboard',          icon: LayoutDashboard, section: 'main'   },
  { name: 'Revenue',     href: '/dashboard/revenue',  icon: TrendingUp,      section: 'main'   },
  { name: 'Sandbox',     href: '/sandbox',            icon: Box,             section: 'main'   },
  { name: 'Marketplace', href: '/marketplace',        icon: Store,           section: 'main'   },
  { name: 'Bot',         href: '/bot',               icon: Bot,             section: 'main'   },
  { name: 'Settings',    href: '/settings',           icon: Settings,        section: 'bottom' },
];

const SidebarContent = ({
  collapsed,
  toggleCollapse,
}: {
  collapsed: boolean;
  toggleCollapse: () => void;
}) => {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'h-full flex flex-col bg-background border-r border-border/60 transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Brand */}
      <div className={cn('flex items-center border-b border-border/60 h-14 px-3', collapsed ? 'justify-center' : 'justify-between')}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <div className="w-7 h-7 shrink-0 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-[15px] tracking-tight whitespace-nowrap overflow-hidden"
              >
                FlawLess
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggleCollapse}
          className={cn(
            'hidden md:flex w-6 h-6 rounded-md items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors shrink-0',
            collapsed && 'hidden'
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
                collapsed ? 'h-9 w-9 justify-center mx-auto' : 'h-9 px-3 gap-3',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
              title={collapsed ? item.name : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
              )}
              <item.icon className="w-[17px] h-[17px] shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="truncate overflow-hidden whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border/60 p-2 space-y-0.5">
        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={toggleCollapse}
            className="w-9 h-9 mx-auto flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          className={cn(
            'flex items-center rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-150 cursor-pointer',
            collapsed ? 'h-9 w-9 justify-center mx-auto' : 'h-9 px-3 gap-3 w-full'
          )}
          title={collapsed ? 'Logout' : undefined}
          onClick={async () => {
            try {
              await apiFetch('/auth/logout', { method: 'POST' });
              setTimeout(() => window.location.replace('/signin'), 100);
            } catch {
              window.location.replace('/signin');
            }
          }}
        >
          <LogOut className="w-[17px] h-[17px] shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <SidebarContent collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 left-3 z-50 w-8 h-8">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[220px]">
            <SidebarContent collapsed={false} toggleCollapse={() => {}} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;

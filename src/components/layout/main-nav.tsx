'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Home, TrendingUp, Search, History, Youtube, User } from 'lucide-react';
import { Logo } from '../shared/logo';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/browse', label: 'Browse', icon: Search },
  { href: '/history', label: 'History', icon: History },
  { href: '/videos', label: 'Videos', icon: Youtube },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="border-b">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior={false}>
                <SidebarMenuButton
                  as="a"
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className={cn(
                    'flex items-center gap-3',
                    pathname.startsWith(item.href) && 'bg-primary/10 text-primary'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-headline">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

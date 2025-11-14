'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from './main-nav';
import { Header } from './header';

const authRoutes = ['/login', '/signup'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute) {
    return <main>{children}</main>;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full">
        <Sidebar className="h-full">
          <MainNav />
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

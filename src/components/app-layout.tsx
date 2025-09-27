'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, FileText, MessageSquare, LogOut, User, Loader2, LayoutDashboard, HelpCircle } from 'lucide-react';
import { KonsultLogo } from './konsult-logo';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const menuItems = [
    {
      href: '/',
      label: 'Policy Inquiry',
      icon: MessageSquare,
    },
    {
      href: '/summarize',
      label: 'Policy Summarization',
      icon: FileText,
    },
    {
      href: '/onboarding',
      label: 'Onboarding Guides',
      icon: BookOpen,
    },
    {
      href: '/manager-dashboard',
      label: 'Manager Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/faq',
      label: 'FAQs',
      icon: HelpCircle,
    },
  ];

  
  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
    if (user && pathname === '/login') {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  if (loading || (!user && pathname !== '/login') || (user && pathname === '/login')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && pathname === '/login') {
    return <>{children}</>;
  }
  

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <KonsultLogo className="size-8 text-primary" />
            <span className="text-xl font-semibold font-headline">Konsult</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="justify-start"
                  tooltip={{
                    children: item.label,
                    className: 'bg-primary text-primary-foreground',
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                   <Avatar className="size-8 border">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="right" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
        
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

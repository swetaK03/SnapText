"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Type, LogIn, LogOut, MessageSquare, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const navItems = [
    { label: 'Converter', href: '/', icon: Home },
    { label: 'Reviews', href: '/reviews', icon: MessageSquare },
  ];

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary font-headline">
          <Type className="w-6 h-6 text-accent" />
          <span>SnapText</span>
        </Link>

        <div className="flex items-center gap-1 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2",
                    pathname === item.href && "bg-accent/10 text-primary hover:bg-accent/20"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-sm text-muted-foreground mr-2">
                  {user.displayName || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotebookPen, LogOut, UserCircle, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out successfully." });
      router.push('/auth/signin');
    } catch (error) {
      toast({ title: "Error signing out", description: "Please try again.", variant: "destructive" });
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <NotebookPen className="h-7 w-7 text-accent" />
          <span className="text-xl font-bold text-foreground hidden sm:inline-block">Poonnachai.c Notes</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-foreground hover:bg-accent hover:text-accent-foreground">
            <Link href="/notes/create">
              <PlusCircle className="mr-0 sm:mr-2 h-5 w-5" />
              <span className="hidden sm:inline">New Note</span>
            </Link>
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-accent">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle size={20}/>}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={() => router.push('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4 text-accent" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/notes/create')}>
                  <PlusCircle className="mr-2 h-4 w-4 text-accent" />
                  <span>New Note</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut} className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

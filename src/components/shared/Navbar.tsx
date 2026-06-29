import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/actions/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto max-w-7xl">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block text-xl tracking-tight">
              FindMy<span className="text-primary">Class</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            <Link href="/" className="transition-colors hover:text-primary text-foreground">
              Beranda
            </Link>
            {user && (
              <Link href="/bookings" className="transition-colors hover:text-primary text-muted-foreground">
                Riwayat Pinjam
              </Link>
            )}
            <Link href="/favorites" className="transition-colors hover:text-primary text-muted-foreground">
              Tersimpan
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <ThemeToggle />
          <nav className="flex items-center space-x-2">
            {user ? (
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm" className="hidden md:flex">
                  Logout ({user.user_metadata?.full_name || 'User'})
                </Button>
              </form>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    Log in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </nav>
  )
}

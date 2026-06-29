import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted/40">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Link href="/" className="mx-auto flex items-center gap-2 font-bold text-2xl tracking-tight mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            FindMy<span className="text-primary">Class</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Selamat Datang
          </h1>
          <p className="text-sm text-muted-foreground">
            Masukkan email dan password Anda untuk masuk
          </p>
        </div>
        
        <Card>
          <CardHeader className="sr-only">
            <CardTitle>Login</CardTitle>
            <CardDescription>Masuk ke akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={login} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="mahasiswa@kampus.ac.id"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Log In
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          Jika Anda belum memiliki akun, silakan hubungi administrator kampus.
        </p>
      </div>
    </div>
  )
}

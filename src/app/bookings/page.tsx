import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Calendar, Clock, MapPin, CheckCircle } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { room: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Peminjaman Saya</h1>
        <p className="text-muted-foreground mt-2">Daftar riwayat ruangan yang telah Anda ajukan peminjamannya.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Belum ada peminjaman</h3>
          <p className="text-muted-foreground">Anda belum pernah meminjam ruangan apapun. Cari ruangan kosong sekarang!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="p-6 border rounded-xl bg-card shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:border-primary/50 transition-colors">
              <div>
                <h3 className="text-xl font-bold text-primary">{booking.room.nama}</h3>
                <p className="text-muted-foreground text-sm flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" /> {booking.room.gedung} - Lt. {booking.room.lantai}
                </p>
                
                <div className="mt-4 space-y-1.5">
                  <p className="text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary" /> Tanggal: {booking.tanggal}
                  </p>
                  <p className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" /> Jam: {booking.jamMulai} - {booking.jamSelesai}
                  </p>
                  <div className="text-sm text-foreground mt-3 bg-muted/50 p-3 rounded-lg border">
                    <span className="font-semibold block mb-1">Keperluan:</span> 
                    {booking.keperluan}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-start">
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-4 py-1.5 rounded-full text-sm flex items-center shadow-sm">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> {booking.status}
                </span>
                <p className="text-xs text-muted-foreground mt-3">
                  Diajukan: {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

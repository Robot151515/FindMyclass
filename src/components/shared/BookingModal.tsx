'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBooking } from '@/actions/bookings'
import { useFormStatus } from 'react-dom'
import { Calendar } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Memproses...' : 'Ajukan Peminjaman'}
    </Button>
  )
}

export default function BookingModal({ roomId, isLoggedIn }: { roomId: string, isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full gap-2 font-bold py-6">
        <Calendar className="w-5 h-5" />
        Ajukan Peminjaman Ruangan
      </Button>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="p-6 border rounded-xl bg-muted/50 text-center space-y-4">
        <p className="text-sm font-medium">Anda harus login untuk meminjam ruangan ini.</p>
        <Button onClick={() => window.location.href = '/login'} className="w-full">Login Sekarang</Button>
        <Button onClick={() => setIsOpen(false)} variant="ghost" className="w-full">Batal</Button>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 border rounded-xl bg-card shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="font-bold text-lg border-b pb-2">Formulir Peminjaman Ruangan</h3>
      <form action={createBooking} className="space-y-4">
        <input type="hidden" name="roomId" value={roomId} />
        
        <div className="space-y-2">
          <Label htmlFor="tanggal">Tanggal Peminjaman</Label>
          <Input type="date" id="tanggal" name="tanggal" required defaultValue={today} min={today} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jamMulai">Jam Mulai</Label>
            <Input type="time" id="jamMulai" name="jamMulai" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jamSelesai">Jam Selesai</Label>
            <Input type="time" id="jamSelesai" name="jamSelesai" required />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="keperluan">Keperluan / Alasan</Label>
          <Textarea id="keperluan" name="keperluan" required placeholder="Contoh: Rapat HIMA, Kerja Kelompok, dll" rows={3} />
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-1/3">Batal</Button>
          <div className="w-2/3">
            <SubmitButton />
          </div>
        </div>
      </form>
    </div>
  )
}

'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const roomId = formData.get('roomId') as string
  const tanggal = formData.get('tanggal') as string
  const jamMulai = formData.get('jamMulai') as string
  const jamSelesai = formData.get('jamSelesai') as string
  const keperluan = formData.get('keperluan') as string

  // Get user from DB
  let dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      nama: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    }
  })

  // Cek bentrok (sederhana) - dalam implementasi asli harus lebih kompleks
  // Disini kita langsung buat karena sebagai prototipe
  await prisma.booking.create({
    data: {
      userId: dbUser.id,
      roomId,
      tanggal,
      jamMulai,
      jamSelesai,
      keperluan,
      status: 'Disetujui' // Auto disetujui karena tidak ada admin
    }
  })

  revalidatePath('/')
  revalidatePath(`/rooms/${roomId}`)
  revalidatePath('/bookings')
  
  redirect('/bookings')
}

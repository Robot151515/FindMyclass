'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function toggleFavorite(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cari apakah user ini ada di database Prisma
  let dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      nama: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    }
  })

  // Cek apakah sudah difavoritkan
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_roomId: {
        userId: dbUser.id,
        roomId: roomId
      }
    }
  })

  if (existingFavorite) {
    // Hapus dari favorit
    await prisma.favorite.delete({
      where: { id: existingFavorite.id }
    })
  } else {
    // Tambah ke favorit
    await prisma.favorite.create({
      data: {
        userId: dbUser.id,
        roomId: roomId
      }
    })
  }

  revalidatePath('/favorites')
  revalidatePath('/')
  revalidatePath(`/rooms/${roomId}`)
}

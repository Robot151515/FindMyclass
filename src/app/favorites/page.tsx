import prisma from "@/lib/prisma";
import RoomCard from "@/components/shared/RoomCard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HeartCrack } from "lucide-react";
import { Prisma } from "@prisma/client";

type RoomWithSchedules = Prisma.RoomGetPayload<{
  include: {
    schedules: true
  }
}>;

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let favoriteRooms: RoomWithSchedules[] = [];

  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());
  
  // Fetch favorites directly using user.id
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      room: {
        include: {
          schedules: {
            where: { hari: today }
          }
        }
      }
    },
    orderBy: { room: { nama: 'asc' } }
  });

  favoriteRooms = favorites.map(fav => fav.room);

  // Get current time in HH:mm
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4 flex-1">
      <div className="mb-10 border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Ruangan Tersimpan</h1>
        <p className="text-muted-foreground mt-2">
          Daftar ruangan kelas yang telah Anda simpan sebagai favorit untuk akses lebih cepat.
        </p>
      </div>

      {favoriteRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <HeartCrack className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Belum ada ruangan favorit</h2>
          <p className="text-muted-foreground max-w-md">
            Anda belum menambahkan ruangan kelas apapun ke daftar favorit. Klik icon hati pada detail ruangan untuk menyimpannya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteRooms.map((room) => {
            let isAvailable = true;
            let currentSchedule = "";

            for (const schedule of room.schedules) {
              if (currentTime >= schedule.jamMulai && currentTime <= schedule.jamSelesai) {
                isAvailable = false;
                currentSchedule = `${schedule.mataKuliah} (${schedule.jamMulai} - ${schedule.jamSelesai})`;
                break;
              }
            }

            return (
              <div key={room.id} className="relative group">
                <RoomCard 
                  id={room.id}
                  nama={room.nama}
                  gedung={room.gedung}
                  lantai={room.lantai}
                  kapasitas={room.kapasitas}
                  fotoURL={room.fotoURL}
                  isAvailable={isAvailable}
                  currentSchedule={currentSchedule}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

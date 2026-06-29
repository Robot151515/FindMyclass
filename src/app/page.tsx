import prisma from "@/lib/prisma";
import RoomCard from "@/components/shared/RoomCard";
import SearchBar from "@/components/shared/SearchBar";
import QuickFilters from "@/components/shared/QuickFilters";
import { Suspense } from "react";
import { Room, Schedule, Booking } from "@prisma/client";

export const dynamic = 'force-dynamic';

type RoomWithSchedules = Room & {
  schedules: Schedule[],
  bookings: Booking[]
};

export default async function Home(props: { searchParams: Promise<{ q?: string, status?: string, building?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const filterStatus = searchParams?.status;
  const filterBuilding = searchParams?.building;

  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());
  
  const rooms = await prisma.room.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { nama: { contains: query, mode: 'insensitive' } },
            { gedung: { contains: query, mode: 'insensitive' } },
            { fasilitas: { contains: query, mode: 'insensitive' } },
          ]
        } : {},
        filterBuilding ? { gedung: { contains: filterBuilding, mode: 'insensitive' } } : {}
      ]
    },
    include: {
      schedules: {
        where: {
          hari: today
        },
        orderBy: {
          jamMulai: 'asc'
        }
      },
      bookings: {
        where: {
          tanggal: new Date().toISOString().split('T')[0],
          status: 'Disetujui'
        },
        orderBy: {
          jamMulai: 'asc'
        }
      }
    }
  }) as RoomWithSchedules[];

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;

  let greeting = "Selamat Datang";
  if (now.getHours() < 11) greeting = "Selamat Pagi";
  else if (now.getHours() < 15) greeting = "Selamat Siang";
  else if (now.getHours() < 18) greeting = "Selamat Sore";
  else greeting = "Selamat Malam";

  let availableCount = 0;

  const processedRooms = rooms.map((room) => {
    let isAvailable = true;
    let currentSchedule = "";
    let nextStatusTime = "";

    const sortedSchedules = [...room.schedules].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
    const sortedBookings = [...room.bookings].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

    // Cek jadwal reguler
    for (const schedule of sortedSchedules) {
      if (currentTime >= schedule.jamMulai && currentTime <= schedule.jamSelesai) {
        isAvailable = false;
        currentSchedule = `${schedule.mataKuliah} (${schedule.jamMulai} - ${schedule.jamSelesai})`;
        nextStatusTime = schedule.jamSelesai;
        break;
      }
    }

    // Cek peminjaman mahasiswa
    if (isAvailable) {
      for (const booking of sortedBookings) {
        if (currentTime >= booking.jamMulai && currentTime <= booking.jamSelesai) {
          isAvailable = false;
          currentSchedule = `Peminjaman: ${booking.keperluan} (${booking.jamMulai} - ${booking.jamSelesai})`;
          nextStatusTime = booking.jamSelesai;
          break;
        }
      }
    }

    if (isAvailable) {
      availableCount++;
      // Gabungkan semua waktu mulai dari jadwal dan booking, cari yang berikutnya
      const allStarts = [
        ...sortedSchedules.map(s => s.jamMulai),
        ...sortedBookings.map(b => b.jamMulai)
      ].sort();
      
      const nextTime = allStarts.find(time => time > currentTime);
      if (nextTime) {
        nextStatusTime = nextTime;
      }
    }

    return { ...room, isAvailable, currentSchedule, nextStatusTime };
  });

  const finalRooms = filterStatus === 'available' 
    ? processedRooms.filter(r => r.isAvailable)
    : processedRooms;

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-primary/5 pt-16 pb-12 px-4 border-b">
        <div className="container max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-block px-5 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-2 shadow-sm">
            ✨ {greeting}, Mahasiswa!
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Temukan Ruang Kelas <span className="text-primary">Kosong</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto pt-2">
            Saat ini terdapat <strong className="text-foreground">{availableCount} ruangan</strong> yang bisa Anda gunakan untuk belajar sekarang.
          </p>
          
          <Suspense fallback={<div className="h-14 mt-8"></div>}>
            <SearchBar />
            <QuickFilters />
          </Suspense>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto py-12 px-4 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Status Ruangan Saat Ini</h2>
          <div className="text-sm font-medium bg-muted px-4 py-1.5 rounded-full text-muted-foreground shadow-sm">
            {finalRooms.length} Ruangan Ditemukan
          </div>
        </div>

        {finalRooms.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
            <h3 className="text-xl font-bold mb-2">Pencarian tidak ditemukan</h3>
            <p className="text-muted-foreground">Tidak ada ruangan yang cocok dengan kriteria Anda. Silakan coba filter lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {finalRooms.map(room => (
              <RoomCard 
                key={room.id}
                id={room.id}
                nama={room.nama}
                gedung={room.gedung}
                lantai={room.lantai}
                kapasitas={room.kapasitas}
                fotoURL={room.fotoURL}
                isAvailable={room.isAvailable}
                currentSchedule={room.currentSchedule}
                nextStatusTime={room.nextStatusTime}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

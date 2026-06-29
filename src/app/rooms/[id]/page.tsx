import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Users, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/shared/FavoriteButton";
import BookingModal from "@/components/shared/BookingModal";
import { createClient } from "@/lib/supabase/server";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      schedules: {
        where: { hari: today },
        orderBy: { jamMulai: 'asc' }
      },
      bookings: {
        where: { tanggal: new Date().toISOString().split('T')[0] }
      }
    }
  });

  if (!room) {
    notFound();
  }

  // Cek status favorit
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isFavorite = false;

  if (user) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_roomId: { userId: user.id, roomId: id } }
    });
    isFavorite = !!fav;
  }

  // Get current time in HH:mm
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;

  let isAvailable = true;
  let currentSchedule = null;

  for (const schedule of room.schedules) {
    if (currentTime >= schedule.jamMulai && currentTime <= schedule.jamSelesai) {
      isAvailable = false;
      currentSchedule = `${schedule.mataKuliah} (${schedule.jamMulai} - ${schedule.jamSelesai})`;
      break;
    }
  }

  // Cek booking mahasiswa
  if (isAvailable) {
    for (const booking of room.bookings) {
      if (currentTime >= booking.jamMulai && currentTime <= booking.jamSelesai && booking.status === 'Disetujui') {
        isAvailable = false;
        currentSchedule = `Peminjaman: ${booking.keperluan} (${booking.jamMulai} - ${booking.jamSelesai})`;
        break;
      }
    }
  }

  // Combine schedules and bookings for timeline
  const allEvents = [
    ...room.schedules.map(s => ({ 
      id: s.id, 
      jamMulai: s.jamMulai, 
      jamSelesai: s.jamSelesai, 
      title: s.mataKuliah, 
      subtitle: `Dosen: ${s.dosen}`,
      type: 'schedule' 
    })),
    ...room.bookings.map(b => ({ 
      id: b.id, 
      jamMulai: b.jamMulai, 
      jamSelesai: b.jamSelesai, 
      title: `Peminjaman Mahasiswa`, 
      subtitle: `Keperluan: ${b.keperluan} (${b.status})`,
      type: 'booking' 
    }))
  ].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 flex-1">
      {/* Hero Image */}
      <div className="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden mb-10 shadow-sm">
        {room.fotoURL ? (
          <Image 
            src={room.fotoURL} 
            alt={room.nama} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
            Tidak ada foto
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        {/* Tombol Favorit di pojok kanan atas */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
          <FavoriteButton roomId={room.id} initialIsFavorite={isFavorite} />
        </div>

        <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {isAvailable ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 px-3 py-1.5 text-sm font-semibold shadow-sm">
                Tersedia Sekarang
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1.5 text-sm font-semibold shadow-sm border-0">
                Sedang Dipakai
              </Badge>
            )}
            <Badge variant="outline" className="bg-background/20 backdrop-blur-md text-white border-white/20 px-3 py-1.5 text-sm font-medium">
              <Users className="w-4 h-4 mr-2" />
              {room.kapasitas} Orang
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">{room.nama}</h1>
          <p className="text-white/90 mt-3 flex items-center text-lg md:text-xl font-medium">
            <MapPin className="w-5 h-5 mr-2" />
            {room.gedung} - Lantai {room.lantai}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4 tracking-tight">Informasi Ruangan</h2>
            <div className="text-lg text-muted-foreground leading-relaxed">
              <p>Ruangan kelas <strong className="text-foreground">{room.nama}</strong> terletak di <strong className="text-foreground">{room.gedung}</strong> pada lantai <strong className="text-foreground">{room.lantai}</strong>. Ruangan ini dirancang untuk menampung kapasitas hingga <strong className="text-foreground">{room.kapasitas} orang</strong> dan dilengkapi dengan berbagai fasilitas pendukung untuk memastikan kenyamanan proses kegiatan belajar mengajar.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-5 tracking-tight">Fasilitas Utama</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {room.fasilitas?.split(',').map((fasilitas, idx) => (
                <div key={idx} className="flex items-center p-4 rounded-2xl border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/30">
                  <CheckCircle className="w-5 h-5 mr-3 text-primary shrink-0" />
                  <span className="font-medium">{fasilitas.trim()}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Timeline */}
        <div>
          <div className="sticky top-24 p-6 md:p-8 rounded-3xl border bg-card shadow-sm">
            <h3 className="text-xl font-bold mb-8 flex items-center tracking-tight">
              <Clock className="w-6 h-6 mr-3 text-primary" />
              Jadwal Hari Ini
            </h3>
            
            {allEvents.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border/60">
                <p className="font-medium text-foreground mb-1">Tidak ada jadwal</p>
                <p className="text-sm">Ruangan kelas ini kosong seharian dan bebas digunakan.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-muted ml-3 space-y-8">
                {allEvents.map((event) => {
                  const isActive = currentTime >= event.jamMulai && currentTime <= event.jamSelesai;
                  const isPast = currentTime > event.jamSelesai;
                  
                  return (
                    <div key={event.id} className="relative pl-6">
                      <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1.5 border-2 border-background ${isActive ? 'bg-primary' : isPast ? 'bg-muted-foreground/30' : event.type === 'booking' ? 'bg-orange-400' : 'bg-primary/40'}`}>
                        {isActive && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></div>}
                      </div>
                      
                      <div className={`p-5 rounded-2xl border transition-all ${isActive ? 'border-primary/40 bg-primary/5 shadow-md ring-1 ring-primary/20' : 'bg-card shadow-sm hover:border-primary/20'} ${event.type === 'booking' && !isActive && !isPast ? 'border-orange-500/30 bg-orange-500/5' : ''}`}>
                        <p className={`text-sm font-bold mb-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                          {event.jamMulai} - {event.jamSelesai}
                        </p>
                        <h4 className={`font-bold leading-tight ${isActive ? 'text-lg' : 'text-base'}`}>{event.title}</h4>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">{event.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Booking Modal / Action */}
          <div className="mt-6">
            <BookingModal roomId={room.id} isLoggedIn={!!user} />
          </div>
        </div>
      </div>
    </div>
  );
}

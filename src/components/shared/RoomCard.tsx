import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoomCardProps {
  id: string;
  nama: string;
  gedung: string;
  lantai: number;
  kapasitas: number;
  fotoURL: string | null;
  isAvailable: boolean;
  currentSchedule?: string;
  nextStatusTime?: string;
}

export default function RoomCard({ id, nama, gedung, lantai, kapasitas, fotoURL, isAvailable, currentSchedule, nextStatusTime }: RoomCardProps) {
  return (
    <Link href={`/rooms/${id}`} className="group block h-full">
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:border-primary/50 bg-card">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {fotoURL ? (
            <Image 
              src={fotoURL} 
              alt={nama} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-3 right-3 flex gap-2">
            {isAvailable ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-0 font-medium px-2.5 py-0.5">
                Kosong
              </Badge>
            ) : (
              <Badge variant="destructive" className="shadow-sm font-medium px-2.5 py-0.5">
                Dipakai
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg leading-none tracking-tight group-hover:text-primary transition-colors">{nama}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                {gedung} - Lt. {lantai}
              </p>
            </div>
            <div className="flex items-center text-xs font-bold bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-md backdrop-blur-sm">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              {kapasitas}
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-border/50">
            {isAvailable ? (
              <div className="text-sm">
                <p className="text-muted-foreground flex items-center mb-1">
                  <span className="relative flex h-2.5 w-2.5 mr-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Tersedia sekarang
                </p>
                {nextStatusTime ? (
                  <p className="font-medium text-foreground flex items-center pl-5 text-xs mt-1.5 opacity-80">
                    <Clock className="w-3 h-3 mr-1.5" /> Kosong hingga {nextStatusTime}
                  </p>
                ) : (
                  <p className="font-medium text-foreground flex items-center pl-5 text-xs mt-1.5 opacity-80">
                    <Clock className="w-3 h-3 mr-1.5" /> Kosong seharian
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm">
                <p className="text-muted-foreground flex items-center mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2.5"></span>
                  Sedang digunakan
                </p>
                <div className="pl-5">
                  <p className="font-medium text-foreground truncate mb-0.5">
                    {currentSchedule || "Ada Jadwal Kelas"}
                  </p>
                  {nextStatusTime && (
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-1.5 flex items-center bg-emerald-500/10 w-fit px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 mr-1.5" /> Tersedia pada {nextStatusTime}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function QuickFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status');
  const currentBuilding = searchParams.get('building');

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
      <Badge 
        variant={!currentStatus && !currentBuilding ? "default" : "outline"} 
        className={`cursor-pointer px-5 py-2 text-sm rounded-full transition-all duration-300 ${!currentStatus && !currentBuilding ? 'shadow-md scale-105' : 'hover:bg-muted'}`}
        onClick={() => { setFilter('status', null); setFilter('building', null); }}
      >
        ✨ Semua Ruangan
      </Badge>
      <Badge 
        variant={currentStatus === 'available' ? "default" : "outline"} 
        className={`cursor-pointer px-5 py-2 text-sm rounded-full transition-all duration-300 ${currentStatus === 'available' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-0 scale-105' : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-950 dark:hover:border-emerald-800'}`}
        onClick={() => setFilter('status', currentStatus === 'available' ? null : 'available')}
      >
        🟢 Hanya Kosong
      </Badge>
      <Badge 
        variant={currentBuilding === 'FST' ? "default" : "outline"} 
        className={`cursor-pointer px-5 py-2 text-sm rounded-full transition-all duration-300 ${currentBuilding === 'FST' ? 'shadow-md scale-105' : 'hover:bg-muted'}`}
        onClick={() => setFilter('building', currentBuilding === 'FST' ? null : 'FST')}
      >
        🏢 Gedung FST
      </Badge>
    </div>
  );
}

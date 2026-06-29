'use client'

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("q")?.toString() || "");

  // Debounce logic
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      
      startTransition(() => {
        router.replace(`/?${params.toString()}`, { scroll: false });
      });
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [value, router, searchParams]);

  return (
    <div className="relative max-w-xl mx-auto mt-8 shadow-sm">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Search className={`w-5 h-5 ${isPending ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
      </div>
      <Input 
        type="text" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari nama gedung, ruangan, atau kapasitas..." 
        className="pl-12 h-14 text-base rounded-full bg-background border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
      />
    </div>
  );
}

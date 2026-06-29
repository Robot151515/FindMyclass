'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/actions/favorites'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

interface FavoriteButtonProps {
  roomId: string;
  initialIsFavorite: boolean;
}

export default function FavoriteButton({ roomId, initialIsFavorite }: FavoriteButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  const handleToggle = async () => {
    setIsPending(true)
    // Optimistic update
    setIsFavorite(!isFavorite)
    
    try {
      await toggleFavorite(roomId)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      // Revert if error
      setIsFavorite(isFavorite)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleToggle} 
      disabled={isPending}
      className={`rounded-full h-12 w-12 border-2 bg-background/50 backdrop-blur-md shadow-sm transition-all duration-300 ${isFavorite ? 'border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-pink-600' : 'border-white/20 text-white hover:bg-white/20'}`}
    >
      <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
    </Button>
  )
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing premium unsplash images...')
  
  const rooms = await prisma.room.findMany()
  
  const safeImages = [
    'https://images.unsplash.com/photo-1577416412292-747c6607f055?w=500&q=80',
    'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=500&q=80',
    'https://images.unsplash.com/photo-1562774053-701939374585?w=500&q=80',
    'https://images.unsplash.com/photo-1606761568499-6d2451b08c66?w=500&q=80'
  ]

  let replaceIndex = 0

  for (const room of rooms) {
    if (room.fotoURL && room.fotoURL.includes('plus.unsplash.com')) {
      const newImage = safeImages[replaceIndex % safeImages.length]
      await prisma.room.update({
        where: { id: room.id },
        data: { fotoURL: newImage }
      })
      console.log(`Updated image for ${room.nama}`)
      replaceIndex++
    }
  }

  console.log('Images fixed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

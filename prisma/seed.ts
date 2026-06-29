import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data without deleting history...')
  
  // Create dummy user if not exists
  let user = await prisma.user.findUnique({ where: { email: 'mahasiswa@kampus.ac.id' } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'mahasiswa@kampus.ac.id',
        nama: 'Budi Santoso',
      },
    })
  }

  // Define comprehensive rooms
  const rooms = [
    // Gedung H (existing)
    { nama: 'H.4.1', gedung: 'Gedung H', lantai: 4, kapasitas: 40, fasilitas: 'AC, Proyektor, Papan Tulis', fotoURL: 'https://images.unsplash.com/photo-1577416412292-747c6607f055?w=500&q=80' },
    { nama: 'H.4.2', gedung: 'Gedung H', lantai: 4, kapasitas: 45, fasilitas: 'AC, Proyektor, Papan Tulis', fotoURL: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&q=80' },
    { nama: 'H.3.1', gedung: 'Gedung H', lantai: 3, kapasitas: 60, fasilitas: 'AC, Proyektor, Smart TV', fotoURL: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80' },
    
    // Gedung I (existing)
    { nama: 'I.2.1', gedung: 'Gedung I', lantai: 2, kapasitas: 30, fasilitas: 'Kipas Angin, Papan Tulis', fotoURL: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&q=80' },
    { nama: 'I.2.2', gedung: 'Gedung I', lantai: 2, kapasitas: 35, fasilitas: 'AC, Papan Tulis', fotoURL: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&q=80' },
    
    // Gedung FST (NEW)
    { nama: 'FST.1.1', gedung: 'Gedung FST', lantai: 1, kapasitas: 100, fasilitas: 'AC Sentral, Proyektor Ganda, Sound System', fotoURL: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&q=80' },
    { nama: 'FST.1.2 (Auditorium)', gedung: 'Gedung FST', lantai: 1, kapasitas: 200, fasilitas: 'AC Sentral, Podium, Panggung, Sound System', fotoURL: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80' },
    { nama: 'FST.2.1 (Lab Komputer)', gedung: 'Gedung FST', lantai: 2, kapasitas: 40, fasilitas: 'AC, 40 PC, Proyektor, Internet Cepat', fotoURL: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80' },
    { nama: 'FST.3.5', gedung: 'Gedung FST', lantai: 3, kapasitas: 50, fasilitas: 'AC, Proyektor, Papan Tulis Kaca', fotoURL: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=500&q=80' },
    { nama: 'FST.3.6', gedung: 'Gedung FST', lantai: 3, kapasitas: 40, fasilitas: 'AC, Papan Tulis, Smart TV', fotoURL: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&q=80' },
  ]

  const createdOrUpdatedRooms = []

  for (const roomData of rooms) {
    const existing = await prisma.room.findFirst({ where: { nama: roomData.nama } })
    if (existing) {
      const updated = await prisma.room.update({
        where: { id: existing.id },
        data: roomData
      })
      createdOrUpdatedRooms.push(updated)
      console.log(`Updated room: ${roomData.nama}`)
    } else {
      const created = await prisma.room.create({ data: roomData })
      createdOrUpdatedRooms.push(created)
      console.log(`Created new room: ${roomData.nama}`)
    }
  }

  // Create schedules for new FST rooms for testing
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date())

  const fstRoom = createdOrUpdatedRooms.find(r => r.nama === 'FST.1.1')
  if (fstRoom) {
    // Only create schedule if it doesn't exist
    const existingSchedule = await prisma.schedule.findFirst({
      where: { roomId: fstRoom.id, hari: today }
    })
    
    if (!existingSchedule) {
      await prisma.schedule.create({
        data: {
          roomId: fstRoom.id,
          mataKuliah: 'Kecerdasan Buatan',
          dosen: 'Prof. Budi',
          hari: today,
          jamMulai: '08:00',
          jamSelesai: '10:30',
        }
      })
      await prisma.schedule.create({
        data: {
          roomId: fstRoom.id,
          mataKuliah: 'Rekayasa Perangkat Lunak',
          dosen: 'Dr. Sarah',
          hari: today,
          jamMulai: '13:00',
          jamSelesai: '15:00',
        }
      })
      console.log('Created schedules for FST.1.1')
    }
  }

  console.log('Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

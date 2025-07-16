// prisma/seed/index.js
import { PrismaClient } from "@prisma/client"
import { seedUsers } from "./seedUsers.js"
import { seedGallery } from "./seedGallery.js"
import { seedPhotos } from "./seedPhotos.js"
import { seedAdminLogs } from "./seedAdminLogs.js"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting full seed process...")

  // 1️⃣ Create Users (Admin + Couple)
  const { admin, couple } = await seedUsers(prisma)

  // 2️⃣ Create a Gallery for the Couple
  const gallery = await seedGallery(prisma, couple.id)

  // 3️⃣ Seed Cloudinary Photos into the Gallery
  await seedPhotos(prisma, gallery.id)

  // 4️⃣ Create an Admin Log Entry
  await seedAdminLogs(prisma, admin.id)

  console.log("✅ All seeding done!")
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
  })

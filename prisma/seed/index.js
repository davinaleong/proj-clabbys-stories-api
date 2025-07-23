// prisma/seed/index.js
import { PrismaClient } from "@prisma/client"
import { seedUser } from "./seedUser.js"
import { seedGallery } from "./seedGallery.js"
import { seedPhotos } from "./seedPhotos.js"
import { seedSetting } from "./seedSetting.js"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting full seed process...")

  // Create a sample Couple
  const user = await seedUser(prisma)

  // Create a Gallery for the Couple
  const gallery = await seedGallery(prisma, user)

  // Seed Cloudinary Photos into the Gallery
  await seedPhotos(prisma, gallery)

  await seedSetting(prisma)

  console.log("✅ All seeding done!")
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
  })

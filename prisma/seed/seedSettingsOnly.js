// prisma/seed/seedSettingsOnly.js
import { PrismaClient } from "@prisma/client"
import { seedSetting } from "./seedSetting.js"

const prisma = new PrismaClient()

async function main() {
  console.log("⚙️ Seeding settings...")

  await seedSetting(prisma)

  console.log("✅ Settings seeded.")
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("❌ Error seeding settings:", err)
    prisma.$disconnect()
  })

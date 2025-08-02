// prisma/seed/seedSettingsOnly.js
import { PrismaClient } from "@prisma/client"
import { seedSetting } from "./seedSetting.js"

const prisma = new PrismaClient()

async function main() {
  console.log("⚙️ Seeding only AppSetting...")

  await seedSetting(prisma)

  console.log("✅ Done seeding AppSetting")
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("❌ Error seeding AppSetting:", err)
    prisma.$disconnect()
    process.exit(1)
  })

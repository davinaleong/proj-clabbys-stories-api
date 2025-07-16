// prisma/seed/seedUsers.js
export async function seedUsers(prisma) {
  console.log("👥 Seeding users...")

  // Seed Admin if not exists
  let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: "Site Admin",
        email: "admin@example.com",
        password: "admin123", // ideally hashed
        role: "ADMIN",
      },
    })
    console.log(`✅ Admin created: ${admin.email}`)
  } else {
    console.log("ℹ️ Admin already exists")
  }

  // Seed Couple if not exists
  let couple = await prisma.user.findFirst({ where: { role: "COUPLE" } })
  if (!couple) {
    couple = await prisma.user.create({
      data: {
        name: "Alice & Bob",
        email: "alicebob@example.com",
        password: "demo123",
        role: "COUPLE",
      },
    })
    console.log(`✅ Couple created: ${couple.email}`)
  } else {
    console.log("ℹ️ Couple already exists")
  }

  return { admin, couple }
}

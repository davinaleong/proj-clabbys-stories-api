// prisma/seed/seedUsers.js
export async function seedUsers(prisma) {
  console.log("👥 Seeding users (couples)...")

  // Check if any couple exists
  const existingCouple = await prisma.user.findFirst({
    where: { email: "alicebob@example.com" },
  })

  if (!existingCouple) {
    const couple = await prisma.user.create({
      data: {
        name: "Alice & Bob",
        email: "alicebob@example.com",
      },
    })
    console.log(`✅ Couple created: ${couple.email}`)
  } else {
    console.log("ℹ️ Sample couple already exists")
  }
}

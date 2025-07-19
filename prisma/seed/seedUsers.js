export async function seedUsers(prisma) {
  console.log("👥 Seeding users (couples)...")

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
    return couple // ✅ return newly created couple
  } else {
    console.log("ℹ️ Sample couple already exists")
    return existingCouple // ✅ return existing couple
  }
}

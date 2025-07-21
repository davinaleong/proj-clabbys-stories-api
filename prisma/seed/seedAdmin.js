import bcrypt from "bcrypt"

export async function seedAdmin(
  prisma,
  email = "admin@example.com",
  password = "supersecurepassword"
) {
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {}, // No update needed, just ensure user exists
    create: {
      email,
      passwordHash,
      role: "ADMIN",
    },
  })

  console.log(`✅ Admin user ensured: ${user.email}`)
  return user
}

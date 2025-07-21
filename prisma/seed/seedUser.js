import bcrypt from "bcrypt"

export async function seedUser(
  prisma,
  {
    name = "Admin",
    email = "admin@example.com",
    password = "supersecurepassword",
    role = "ADMIN",
  } = {}
) {
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      passwordHash,
      role,
    },
  })

  console.log(`✅ ${user.name} user ensured: ${user.email}`)
  return user
}

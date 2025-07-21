import bcrypt from "bcrypt"

export async function seedGallery(prisma, user) {
  console.log("🖼️ Seeding gallery...")

  const defaultPassphrase = "secret123"
  const passphraseHash = await bcrypt.hash(defaultPassphrase, 10)

  const gallery = await prisma.gallery.create({
    data: {
      title: "Sample Cloudinary Gallery",
      description: "Demo gallery with placeholder Cloudinary images",
      passphraseHash,
      status: "PUBLISHED",
      user: {
        connect: { id: user.id },
      },
    },
  })

  console.log(`✅ Gallery created: ${gallery.title}`)
  console.log(`🔑 Default passphrase: ${defaultPassphrase} (hashed in DB)`)

  return gallery
}

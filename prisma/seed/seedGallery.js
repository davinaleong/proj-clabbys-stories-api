import bcrypt from "bcrypt"

export async function seedGallery(prisma, coupleId) {
  console.log("🖼️ Seeding gallery...")

  // ✅ Hash the default passphrase
  const defaultPassphrase = "secret123"
  const passphraseHash = await bcrypt.hash(defaultPassphrase, 10)

  const gallery = await prisma.gallery.create({
    data: {
      title: "Sample Cloudinary Gallery",
      description: "Demo gallery with placeholder Cloudinary images",
      passphraseHash, // ✅ store hashed passphrase
      userId: coupleId,
      isPublished: true,
    },
  })

  console.log(`✅ Gallery created: ${gallery.title}`)
  console.log(`🔑 Default passphrase: ${defaultPassphrase} (hashed in DB)`)

  return gallery
}

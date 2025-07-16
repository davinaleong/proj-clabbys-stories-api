// prisma/seed/seedGallery.js
export async function seedGallery(prisma, coupleId) {
  console.log("🖼️ Seeding gallery...")

  const gallery = await prisma.gallery.create({
    data: {
      title: "Sample Cloudinary Gallery",
      description: "Demo gallery with placeholder Cloudinary images",
      passphrase: "secret123",
      userId: coupleId,
      isPublished: true,
    },
  })

  console.log(`✅ Gallery created: ${gallery.title}`)
  return gallery
}

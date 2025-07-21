// prisma/seed/seedPhotos.js
export async function seedPhotos(prisma, gallery) {
  const photos = [
    {
      title: "Photo 0007",
      imageUrl:
        "https://res.cloudinary.com/dunxiwx8u/image/upload/v1751382065/0007_puz5uy.jpg",
    },
    {
      title: "Photo 0004",
      imageUrl:
        "https://res.cloudinary.com/dunxiwx8u/image/upload/v1751382065/0004_ixnzyi.jpg",
    },
    {
      title: "Photo 0006",
      imageUrl:
        "https://res.cloudinary.com/dunxiwx8u/image/upload/v1751382064/0006_yhssib.jpg",
    },
    {
      title: "Photo 0002",
      imageUrl:
        "https://res.cloudinary.com/dunxiwx8u/image/upload/v1751382063/0002_he1zuv.jpg",
    },
    {
      title: "Photo 0001",
      imageUrl:
        "https://res.cloudinary.com/dunxiwx8u/image/upload/v1751382063/0001_ogcdbp.jpg",
    },
    {
      title: "Photo 0008",
      imageUrl:
        "https://res.cloudinary.com/dunxiwx8u/image/upload/v1751382063/0008_qb1yxy.jpg",
    },
  ]

  console.log(`📸 Seeding ${photos.length} photos for gallery ${gallery.id}`)

  for (const photo of photos) {
    await prisma.photo.create({
      data: {
        title: photo.title,
        imageUrl: photo.imageUrl,
        gallery: {
          connect: { id: gallery.id },
        },
      },
    })
    console.log(`✅ Added ${photo.title}`)
  }
}

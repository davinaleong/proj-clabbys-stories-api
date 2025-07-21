import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { env } from "./../config/env.js"

export const resolvers = {
  Query: {
    users: (_, __, { prisma }) => prisma.user.findMany(),
    user: (_, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),

    galleries: (_, __, { prisma }) => prisma.gallery.findMany(),
    gallery: (_, { id }, { prisma }) =>
      prisma.gallery.findUnique({ where: { id } }),

    galleriesPaginated: async (_, { after, first }, { prisma }) => {
      const take = first ?? 10
      const galleries = await prisma.gallery.findMany({
        take: take + 1,
        ...(after && { cursor: { id: after }, skip: 1 }),
        orderBy: { createdAt: "desc" },
      })

      const hasNextPage = galleries.length > take
      const edges = galleries.slice(0, take).map((g) => ({
        cursor: g.id,
        node: g,
      }))

      return {
        edges,
        pageInfo: {
          endCursor: edges.length ? edges[edges.length - 1].cursor : null,
          hasNextPage,
        },
      }
    },

    // ✅ Photos
    photos: (_, __, { prisma }) =>
      prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),

    galleryPhotos: (_, { galleryId }, { prisma }) =>
      prisma.photo.findMany({
        where: { galleryId },
        orderBy: { position: "asc" }, // ✅ always sorted by position
      }),

    photosPaginated: async (_, { after, first }, { prisma }) => {
      const take = first ?? 10
      const photos = await prisma.photo.findMany({
        take: take + 1,
        ...(after && { cursor: { id: after }, skip: 1 }),
        orderBy: { createdAt: "desc" },
      })

      const hasNextPage = photos.length > take
      const edges = photos.slice(0, take).map((p) => ({
        cursor: p.id,
        node: p,
      }))

      return {
        edges,
        pageInfo: {
          endCursor: edges.length ? edges[edges.length - 1].cursor : null,
          hasNextPage,
        },
      }
    },

    appSettings: (_, __, { prisma }) => prisma.appSetting.findMany(),
    appSetting: (_, { id }, { prisma }) =>
      prisma.appSetting.findUnique({ where: { id } }),
  },

  Mutation: {
    // ✅ Existing createUser (still works for basic non-auth users)
    createUser: (_, { data }, { prisma }) => prisma.user.create({ data }),

    // ✅ Register User with password hashing
    registerUser: async (_, { data }, { prisma }) => {
      const { name, email, password } = data

      // Check if user exists
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) throw new Error("User already exists")

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      return prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      })
    },

    // ✅ Login User
    loginUser: async (_, { email, password }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !user.passwordHash)
        throw new Error("Invalid email or password")

      // Compare password with bcrypt
      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) throw new Error("Invalid email or password")

      // Sign JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      )

      return { token, user }
    },

    // ✅ Gallery Mutations
    createGallery: async (_, { data }, { prisma }) => {
      const { title, description, date, userId, passphrase, status } = data

      // ✅ Optional: Hash passphrase if provided
      let passphraseHash = null
      if (passphrase) {
        passphraseHash = await bcrypt.hash(passphrase, 10)
      }

      // ✅ Normalize date (convert to proper ISO/Date object)
      let normalizedDate = null
      if (date) {
        const parsed = new Date(date)
        if (!isNaN(parsed)) {
          normalizedDate = parsed
        } else {
          throw new Error("Invalid date format. Please use ISO 8601.")
        }
      }

      return prisma.gallery.create({
        data: {
          title,
          description,
          date: normalizedDate,
          userId,
          passphraseHash,
          status: status || "DRAFT",
        },
      })
    },

    updateGallery: async (_, { id, data }, { prisma }) => {
      let updateData = { ...data }

      // ✅ Normalize date if provided
      if (data.date) {
        const parsed = new Date(data.date)
        if (!isNaN(parsed)) {
          updateData.date = parsed
        } else {
          throw new Error("Invalid date format. Please use ISO 8601.")
        }
      }

      // ✅ If passphrase is being updated → hash it
      if (data.passphrase) {
        updateData.passphraseHash = await bcrypt.hash(data.passphrase, 10)
        delete updateData.passphrase
      }

      return prisma.gallery.update({
        where: { id },
        data: updateData,
      })
    },

    publishGallery: (_, { id }, { prisma }) =>
      prisma.gallery.update({
        where: { id },
        data: { status: "PUBLISHED" }, // ✅ now uses status
      }),

    setGalleryPassphrase: async (_, { id, passphrase }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({ where: { id } })
      if (!gallery) throw new Error("Gallery not found")
      const hash = await bcrypt.hash(passphrase, 10)
      await prisma.gallery.update({
        where: { id },
        data: { passphraseHash: hash },
      })
      return true
    },

    loginGallery: async (_, { id, passphrase }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({ where: { id } })
      if (!gallery || !gallery.passphraseHash)
        throw new Error("Gallery not initialized for passphrase login")

      const valid = await bcrypt.compare(passphrase, gallery.passphraseHash)
      if (!valid) throw new Error("Invalid passphrase")

      const token = jwt.sign({ galleryId: gallery.id }, env.JWT_SECRET, {
        expiresIn: "7d",
      })

      return { token, gallery }
    },

    // ✅ Photos
    createPhoto: async (_, { data }, { prisma }) => {
      const { takenAt, galleryId, ...rest } = data

      let normalizedTakenAt = null
      if (takenAt) {
        const parsed = new Date(takenAt)
        if (!isNaN(parsed)) {
          normalizedTakenAt = parsed
        } else {
          throw new Error("Invalid takenAt date format")
        }
      }

      // ✅ Calculate default position → last in gallery
      let nextPosition = 1
      if (galleryId) {
        const maxPosition = await prisma.photo.aggregate({
          where: { galleryId },
          _max: { position: true },
        })
        nextPosition = (maxPosition._max.position || 0) + 1
      }

      return prisma.photo.create({
        data: {
          ...rest,
          galleryId,
          takenAt: normalizedTakenAt,
          position: nextPosition,
        },
      })
    },

    createPhotos: async (_, { data }, { prisma }) => {
      await prisma.photo.createMany({ data, skipDuplicates: true })
      return prisma.photo.findMany({
        orderBy: { createdAt: "desc" },
      })
    },

    assignPhotoToGallery: async (_, { photoId, galleryId }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({
        where: { id: galleryId },
      })
      if (!gallery) throw new Error("Gallery not found")

      // ✅ Assign to end of gallery
      const maxPosition = await prisma.photo.aggregate({
        where: { galleryId },
        _max: { position: true },
      })
      const newPosition = (maxPosition._max.position || 0) + 1

      return prisma.photo.update({
        where: { id: photoId },
        data: { galleryId, position: newPosition },
      })
    },

    updatePhoto: async (_, { id, data }, { prisma }) => {
      let updateData = { ...data }

      // ✅ Normalize takenAt if provided
      if (data.takenAt) {
        const parsed = new Date(data.takenAt)
        if (!isNaN(parsed)) {
          updateData.takenAt = parsed
        } else {
          throw new Error(
            "Invalid takenAt date format. Use ISO 8601 (e.g., 2025-07-20T12:00:00.000Z)."
          )
        }
      }

      return prisma.photo.update({
        where: { id },
        data: updateData,
      })
    },

    // ✅ Reorder: Single photo
    updatePhotoPosition: async (_, { photoId, position }, { prisma }) => {
      return prisma.photo.update({
        where: { id: photoId },
        data: { position },
      })
    },

    // ✅ Reorder: Batch
    updatePhotoOrder: async (_, { updates }, { prisma }) => {
      const transactions = updates.map((u) =>
        prisma.photo.update({
          where: { id: u.photoId },
          data: { position: u.position },
        })
      )
      return prisma.$transaction(transactions)
    },

    updateAppSetting: async (_, { id, data }, { prisma }) => {
      return prisma.appSetting.update({
        where: { id },
        data: {
          ...(data.applicationName && {
            applicationName: data.applicationName,
          }),
          ...(data.lightboxMode && { lightboxMode: data.lightboxMode }),
          ...(data.defaultSortOrder && {
            defaultSortOrder: data.defaultSortOrder,
          }),
          ...(data.defaultDateFormat && {
            defaultDateFormat: data.defaultDateFormat,
          }),
        },
      })
    },
  },

  User: {
    galleries: (parent, _, { prisma }) =>
      prisma.gallery.findMany({ where: { userId: parent.id } }),
  },

  Gallery: {
    owner: (parent, _, { prisma }) => {
      if (!parent.ownerId) return null
      return prisma.user.findUnique({ where: { id: parent.ownerId } })
    },
    photos: (parent, _, { prisma }) =>
      prisma.photo.findMany({
        where: { galleryId: parent.id },
        orderBy: { position: "asc" }, // ✅ always sorted by position
      }),
  },

  Photo: {
    gallery: (parent, _, { prisma }) =>
      parent.galleryId
        ? prisma.gallery.findUnique({ where: { id: parent.galleryId } })
        : null,
  },
}

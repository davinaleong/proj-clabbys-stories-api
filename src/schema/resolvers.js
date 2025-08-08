import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from "cloudinary"
import { env } from "./../config/env.js"
import { GalleryStatus, LightboxMode, SortOrder, DateFormat } from "./enums.js"
import extractPublicId from "./../helpers/extract-public-id.js"

function encodeCursor(createdAt, id) {
  return Buffer.from(`${createdAt.toISOString()}::${id}`).toString("base64")
}

function decodeCursor(cursor) {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8")
  const [createdAtStr, id] = decoded.split("::")
  return { createdAt: new Date(createdAtStr), id }
}

export const resolvers = {
  Query: {
    users: (_, __, { prisma }) => prisma.user.findMany(),
    user: (_, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),

    galleries: (_, __, { prisma }) =>
      prisma.gallery.findMany({
        where: { deletedAt: null },
      }),

    gallery: (_, { id }, { prisma }) =>
      prisma.gallery.findUnique({
        where: { id, deletedAt: null },
      }),

    galleriesPaginated: async (_, { after, first = 12 }, { prisma }) => {
      const take = first + 1
      let cursorFilter = {}

      if (after) {
        const { createdAt, id } = decodeCursor(after)
        cursorFilter = {
          OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: id } }],
        }
      }

      const galleries = await prisma.gallery.findMany({
        where: {
          deletedAt: null,
          ...cursorFilter,
        },
        take,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })

      const hasNextPage = galleries.length > first
      const edges = galleries.slice(0, first).map((g) => ({
        cursor: encodeCursor(g.createdAt, g.id),
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

    archives: (_, __, { prisma }) =>
      prisma.gallery.findMany({
        where: { deletedAt: { not: null } },
      }),

    archive: (_, { id }, { prisma }) =>
      prisma.gallery.findFirst({
        where: {
          id,
          deletedAt: { not: null },
        },
      }),

    archivesPaginated: async (_, { after, first = 12 }, { prisma }) => {
      const take = first + 1
      let cursorFilter = {}

      if (after) {
        const { createdAt, id } = decodeCursor(after)
        cursorFilter = {
          OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: id } }],
        }
      }

      const galleries = await prisma.gallery.findMany({
        where: {
          deletedAt: { not: null },
          ...cursorFilter,
        },
        take,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })

      const hasNextPage = galleries.length > first
      const edges = galleries.slice(0, first).map((g) => ({
        cursor: encodeCursor(g.createdAt, g.id),
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

    photos: (_, __, { prisma }) =>
      prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),

    galleryPhotos: (_, { galleryId }, { prisma }) =>
      prisma.photo.findMany({
        where: { galleryId },
        orderBy: { position: "asc" },
      }),

    photosPaginated: async (_, { after, first = 12 }, { prisma }) => {
      const take = first + 1
      let cursorFilter = {}

      if (after) {
        const { createdAt, id } = decodeCursor(after)
        cursorFilter = {
          OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: id } }],
        }
      }

      const photos = await prisma.photo.findMany({
        where: cursorFilter,
        take,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      })

      const hasNextPage = photos.length > first
      const edges = photos.slice(0, first).map((p) => ({
        cursor: encodeCursor(p.createdAt, p.id),
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

    galleryStatusEnum: () => ({
      values: Object.keys(GalleryStatus).map((name) => ({ name })),
    }),
    lightboxModeEnum: () => ({
      values: Object.keys(LightboxMode).map((name) => ({ name })),
    }),
    sortOrderEnum: () => ({
      values: Object.keys(SortOrder).map((name) => ({ name })),
    }),
    dateFormatEnum: () => ({
      values: Object.keys(DateFormat).map((name) => ({ name })),
    }),
  },

  Mutation: {
    createUser: async (_, { data }, { prisma }) => {
      const existing = await prisma.user.findFirst()
      if (existing) throw new Error("User already exists. Only one allowed.")

      const { name, email, password } = data
      const passwordHash = await bcrypt.hash(password, 10)

      return prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      })
    },

    registerUser: async (_, { data }, { prisma }) => {
      const { name, email, password } = data
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) throw new Error("User already exists")

      const passwordHash = await bcrypt.hash(password, 10)
      return prisma.user.create({
        data: { name, email, passwordHash },
      })
    },

    loginUser: async (_, { email, password }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) throw new Error("Invalid credentials")

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) throw new Error("Invalid credentials")

      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
        expiresIn: "7d",
      })

      return { token, user }
    },

    logoutUser: async (_, __, { res }) => {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })

      return { success: true, message: "Logged out successfully" }
    },

    createGallery: async (_, { data }, { prisma }) => {
      const { title, description, date, passphrase, status } = data

      const passphraseHash = passphrase
        ? await bcrypt.hash(passphrase, 10)
        : null

      const normalizedDate = date ? new Date(date) : null
      if (date && isNaN(normalizedDate)) {
        throw new Error("Invalid date format. Please use ISO 8601.")
      }

      return prisma.gallery.create({
        data: {
          title,
          description,
          date: normalizedDate,
          passphraseHash,
          status: status || "DRAFT",
        },
      })
    },

    updateGallery: async (_, { id, data }, { prisma }) => {
      const updateData = { ...data }

      if (data.status) {
        if (!Object.keys(GalleryStatus).includes(data.status)) {
          throw new Error(`Invalid status: ${data.status}`)
        }
        updateData.status = GalleryStatus[data.status]
      }

      if (data.date) {
        const parsed = new Date(data.date)
        if (isNaN(parsed)) {
          throw new Error("Invalid date format. Please use ISO 8601.")
        }
        updateData.date = parsed
      }

      if (data.passphrase) {
        updateData.passphraseHash = await bcrypt.hash(data.passphrase, 10)
        delete updateData.passphrase
      }

      return prisma.gallery.update({
        where: { id, deletedAt: null },
        data: updateData,
      })
    },

    archiveGallery: async (_, { id }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({ where: { id } })
      if (!gallery) throw new Error("Gallery not found")
      if (gallery.deletedAt) throw new Error("Gallery already archived")

      return prisma.gallery.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    },

    restoreGallery: async (_, { id }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({ where: { id } })
      if (!gallery) throw new Error("Gallery not found")
      if (!gallery.deletedAt) throw new Error("Gallery is not archived")

      return prisma.gallery.update({
        where: { id },
        data: { deletedAt: null },
      })
    },

    deleteGallery: async (_, { id }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({
        where: { id },
        include: { photos: true },
      })

      if (!gallery) throw new Error("Gallery not found")
      if (!gallery.deletedAt) {
        throw new Error("Only archived galleries can be permanently deleted")
      }

      for (const photo of gallery.photos) {
        if (photo.imageUrl?.includes("cloudinary.com")) {
          const publicId = extractPublicId(photo.imageUrl)
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId)
            } catch (err) {
              console.error(`Cloudinary deletion failed for ${publicId}:`, err)
            }
          }
        }
      }

      await prisma.photo.deleteMany({ where: { galleryId: id } })
      return prisma.gallery.delete({ where: { id } })
    },

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
      if (!gallery || !gallery.passphraseHash) {
        throw new Error("Gallery not initialized for passphrase login")
      }

      const valid = await bcrypt.compare(passphrase, gallery.passphraseHash)
      if (!valid) throw new Error("Invalid passphrase")

      const token = jwt.sign({ galleryId: gallery.id }, env.JWT_SECRET, {
        expiresIn: "7d",
      })

      return { token, gallery }
    },

    createPhoto: async (_, { data }, { prisma }) => {
      const { takenAt, galleryId, imageUrl, fileSize, ...rest } = data
      if (!galleryId) throw new Error("Photos must belong to a gallery.")

      const allowedExt = /\.(jpg|jpeg|png|gif|webp)$/i
      if (!allowedExt.test(imageUrl)) {
        throw new Error("Only JPG, PNG, GIF, WEBP allowed.")
      }

      if (fileSize && fileSize > 5 * 1024 * 1024) {
        throw new Error("File exceeds 5MB limit.")
      }

      const normalizedTakenAt = takenAt ? new Date(takenAt) : null
      if (takenAt && isNaN(normalizedTakenAt)) {
        throw new Error("Invalid takenAt date format")
      }

      const maxPosition = await prisma.photo.aggregate({
        where: { galleryId },
        _max: { position: true },
      })
      const nextPosition = (maxPosition._max.position || 0) + 1

      return prisma.photo.create({
        data: {
          ...rest,
          imageUrl,
          galleryId,
          takenAt: normalizedTakenAt,
          position: nextPosition,
        },
      })
    },

    createPhotos: async (_, { data }, { prisma }) => {
      if (data.length > 5) throw new Error("Max 5 photos per batch.")

      const allowedExt = /\.(jpg|jpeg|png|gif|webp)$/i
      const createdPhotos = []

      for (const photo of data) {
        if (!photo.galleryId)
          throw new Error("Each photo must have a galleryId.")

        if (!allowedExt.test(photo.imageUrl))
          throw new Error(`Unsupported file: ${photo.imageUrl}`)

        if (photo.fileSize && photo.fileSize > 5 * 1024 * 1024)
          throw new Error(`File ${photo.imageUrl} exceeds 5MB limit.`)

        const maxPosition = await prisma.photo.aggregate({
          where: { galleryId: photo.galleryId },
          _max: { position: true },
        })
        const nextPosition = (maxPosition._max.position || 0) + 1

        const p = await prisma.photo.create({
          data: { ...photo, position: nextPosition },
        })
        createdPhotos.push(p)
      }

      return createdPhotos
    },

    assignPhotoToGallery: async (_, { photoId, galleryId }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({
        where: { id: galleryId },
      })
      if (!gallery) throw new Error("Gallery not found")

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
      const updateData = { ...data }

      if (data.takenAt) {
        const parsed = new Date(data.takenAt)
        if (isNaN(parsed)) {
          throw new Error(
            "Invalid takenAt date format. Use ISO 8601 (e.g., 2025-07-20T12:00:00.000Z)."
          )
        }
        updateData.takenAt = parsed
      }

      return prisma.photo.update({
        where: { id },
        data: updateData,
      })
    },

    updatePhotoPosition: async (_, { photoId, position }, { prisma }) =>
      prisma.photo.update({
        where: { id: photoId },
        data: { position },
      }),

    updatePhotoOrder: async (_, { updates }, { prisma }) => {
      const transactions = updates.map((u) =>
        prisma.photo.update({
          where: { id: u.photoId },
          data: { position: u.position },
        })
      )
      return prisma.$transaction(transactions)
    },

    createAppSetting: async (_, { data }, { prisma }) => {
      const existing = await prisma?.appSetting.findFirst()
      if (existing)
        throw new Error("AppSetting already exists. Only one is allowed.")

      return prisma.appSetting.create({ data })
    },

    updateAppSetting: async (_, { id, data }, { prisma }) =>
      prisma.appSetting.update({
        where: { id },
        data,
      }),
  },

  User: {
    galleries: (parent, _, { prisma }) =>
      prisma.gallery.findMany({ where: { userId: parent.id } }),
  },

  Gallery: {
    photos: (parent, _, { prisma }) =>
      prisma.photo.findMany({
        where: { galleryId: parent.id },
        orderBy: { position: "asc" },
      }),
  },

  Photo: {
    gallery: (parent, _, { prisma }) =>
      parent.galleryId
        ? prisma.gallery.findUnique({ where: { id: parent.galleryId } })
        : null,
  },
}

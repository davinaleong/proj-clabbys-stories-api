import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { randomBytes } from "crypto"
import { env } from "./../config/env.js"

export const resolvers = {
  Query: {
    // ==============================
    // ✅ USER QUERIES (couples only)
    // ==============================
    users: async (_, __, { prisma }) => prisma.user.findMany(),

    user: async (_, { id }, { prisma }) =>
      prisma.user.findUnique({ where: { id } }),

    // ==============================
    // ✅ GALLERY QUERIES
    // ==============================
    galleries: async (_, { userId }, { prisma }) => {
      if (userId) {
        return prisma.gallery.findMany({ where: { userId } })
      }
      return prisma.gallery.findMany()
    },

    gallery: async (_, { id }, { prisma }) =>
      prisma.gallery.findUnique({ where: { id } }),

    // ✅ Cursor-based Pagination for Galleries
    galleriesPaginated: async (_, { userId, after, first }, { prisma }) => {
      const take = first ?? 10

      const whereClause = userId ? { userId } : {}

      const galleries = await prisma.gallery.findMany({
        where: whereClause,
        take: take + 1, // fetch 1 extra to check if next page exists
        ...(after && {
          cursor: { id: after },
          skip: 1, // skip the cursor itself
        }),
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

    // ==============================
    // ✅ PHOTO QUERIES
    // ==============================
    photos: async (_, { galleryId }, { prisma }) =>
      prisma.photo.findMany({ where: { galleryId } }),

    // ✅ Cursor-based Pagination for Photos
    photosPaginated: async (_, { galleryId, after, first }, { prisma }) => {
      const take = first ?? 10

      const photos = await prisma.photo.findMany({
        where: { galleryId },
        take: take + 1,
        ...(after && {
          cursor: { id: after },
          skip: 1,
        }),
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

    // ==============================
    // ✅ APP SETTINGS QUERIES
    // ==============================
    appSettings: async (_, __, { prisma }) => prisma.appSetting.findMany(),

    appSetting: async (_, { id }, { prisma }) =>
      prisma.appSetting.findUnique({ where: { id } }),
  },

  Mutation: {
    // ==============================
    // ✅ USER MUTATIONS (couples only)
    // ==============================
    createUser: async (_, { data }, { prisma }) => prisma.user.create({ data }),

    // ==============================
    // ✅ GALLERY MUTATIONS
    // ==============================
    createGallery: async (_, { data }, { prisma }) => {
      // ✅ Generate a unique magic link token
      const magicLinkToken = randomBytes(16).toString("hex")

      // ✅ Generate a random 4-digit PIN
      const plainPIN = Math.floor(1000 + Math.random() * 9000).toString()
      const pinHash = await bcrypt.hash(plainPIN, 10)

      // ✅ Create gallery with magic link + hashed PIN
      const gallery = await prisma.gallery.create({
        data: {
          ...data,
          magicLinkToken,
          pinHash,
        },
      })

      // ✅ Return the gallery + plain PIN (send via email)
      return {
        ...gallery,
        plainPIN, // only returned once after creation
      }
    },

    publishGallery: async (_, { id }, { prisma }) =>
      prisma.gallery.update({
        where: { id },
        data: { isPublished: true },
      }),

    // ==============================
    // ✅ MAGIC LINK + PIN AUTH
    // ==============================
    requestEditorAccess: async (_, { token, pin }, { prisma }) => {
      // ✅ Find gallery by magicLinkToken
      const gallery = await prisma.gallery.findUnique({
        where: { magicLinkToken: token },
      })

      if (!gallery) throw new Error("Invalid magic link")

      // ✅ Verify PIN against stored hash
      const valid = await bcrypt.compare(pin, gallery.pinHash)
      if (!valid) throw new Error("Invalid PIN")

      // ✅ Issue short-lived JWT (e.g., valid for 24 hours)
      const authToken = jwt.sign({ galleryId: gallery.id }, env.JWT_SECRET, {
        expiresIn: "24h",
      })

      return { token: authToken, gallery }
    },

    // ==============================
    // ✅ PHOTO MUTATIONS
    // ==============================
    createPhoto: async (_, { data }, { prisma }) =>
      prisma.photo.create({ data }),

    createPhotos: async (_, { data }, { prisma }) => {
      const { galleryId, photos } = data

      // ✅ Ensure gallery exists
      const gallery = await prisma.gallery.findUnique({
        where: { id: galleryId },
      })
      if (!gallery) throw new Error("Gallery not found")

      // ✅ Attach galleryId to each photo
      const preparedPhotos = photos.map((photo) => ({
        ...photo,
        galleryId,
      }))

      await prisma.photo.createMany({
        data: preparedPhotos,
        skipDuplicates: true,
      })

      return prisma.photo.findMany({
        where: { galleryId },
        orderBy: { createdAt: "desc" },
      })
    },

    // ==============================
    // ✅ APP SETTINGS MUTATION
    // ==============================
    updateAppSetting: async (_, { id, data }, { prisma }) => {
      if (
        !data.applicationName &&
        !data.lightboxMode &&
        !data.defaultSortOrder
      ) {
        throw new Error("No update fields provided")
      }

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
        },
      })
    },
  },

  // ==============================
  // ✅ NESTED RESOLVERS
  // ==============================
  User: {
    galleries: (parent, _, { prisma }) =>
      prisma.gallery.findMany({ where: { userId: parent.id } }),
  },

  Gallery: {
    owner: (parent, _, { prisma }) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
    photos: (parent, _, { prisma }) =>
      prisma.photo.findMany({ where: { galleryId: parent.id } }),
  },

  Photo: {
    gallery: (parent, _, { prisma }) =>
      prisma.gallery.findUnique({ where: { id: parent.galleryId } }),
  },
}

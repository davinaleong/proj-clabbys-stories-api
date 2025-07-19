import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
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
        take: take + 1,
        ...(after && {
          cursor: { id: after },
          skip: 1,
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
    createGallery: async (_, { data }, { prisma }) =>
      prisma.gallery.create({ data }),

    publishGallery: async (_, { id }, { prisma }) =>
      prisma.gallery.update({
        where: { id },
        data: { isPublished: true },
      }),

    // ✅ Set a hashed passphrase (only if not already set)
    setGalleryPassphrase: async (_, { id, passphrase }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({ where: { id } })
      if (!gallery) throw new Error("Gallery not found")
      if (gallery.passphraseHash) throw new Error("Passphrase already set")

      const hash = await bcrypt.hash(passphrase, 10)
      await prisma.gallery.update({
        where: { id },
        data: { passphraseHash: hash },
      })

      return true
    },

    // ✅ Login with passphrase → return JWT
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

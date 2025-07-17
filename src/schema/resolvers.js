import jwt from "jsonwebtoken"
import { env } from "./config/env.js"

export const resolvers = {
  Query: {
    users: async (_, __, { prisma }) => {
      return prisma.user.findMany()
    },
    user: async (_, { id }, { prisma }) => {
      return prisma.user.findUnique({ where: { id } })
    },

    galleries: async (_, { userId }, { prisma }) => {
      if (userId) {
        return prisma.gallery.findMany({ where: { userId } })
      }
      return prisma.gallery.findMany() // return all for admin
    },
    gallery: async (_, { id }, { prisma }) => {
      return prisma.gallery.findUnique({ where: { id } })
    },
    galleryByPassphrase: async (_, { passphrase }, { prisma }) => {
      return prisma.gallery.findFirst({ where: { passphrase } })
    },

    photos: async (_, { galleryId }, { prisma }) => {
      return prisma.photo.findMany({ where: { galleryId } })
    },

    adminActivityLogs: async (_, __, { prisma }) => {
      return prisma.adminActivityLog.findMany()
    },

    couples: async (_, __, { prisma }) => {
      return prisma.user.findMany({ where: { role: "COUPLE" } })
    },

    // ✅ New: Fetch gallery using guest token
    guestGallery: async (_, { token }, { prisma }) => {
      try {
        const payload = jwt.verify(token, env.GUEST_SECRET)

        const gallery = await prisma.gallery.findUnique({
          where: { id: payload.galleryId },
          include: { photos: true },
        })

        if (!gallery) throw new Error("Gallery not found")

        return gallery
      } catch (err) {
        throw new Error("Invalid or expired guest token")
      }
    },
  },

  Mutation: {
    createUser: async (_, { data }, { prisma }) => {
      return prisma.user.create({ data })
    },
    createGallery: async (_, { data }, { prisma }) => {
      return prisma.gallery.create({ data })
    },
    createPhoto: async (_, { data }, { prisma }) => {
      return prisma.photo.create({ data })
    },
    publishGallery: async (_, { id }, { prisma }) => {
      return prisma.gallery.update({
        where: { id },
        data: { isPublished: true },
      })
    },
    logAdminAction: async (_, { adminId, action, details }, { prisma }) => {
      return prisma.adminActivityLog.create({
        data: { adminId, action, details },
      })
    },

    // ✅ New: Unlock gallery with passphrase and issue guest token
    unlockGallery: async (_, { passphrase }, { prisma }) => {
      const gallery = await prisma.gallery.findFirst({
        where: { passphrase },
      })

      if (!gallery) {
        throw new Error("Invalid passphrase")
      }

      // Issue a temporary JWT for guest access
      const token = jwt.sign(
        { galleryId: gallery.id },
        env.GUEST_SECRET,
        { expiresIn: "2h" } // expires in 2 hours
      )

      return { gallery, token }
    },
  },

  // === Nested Resolvers ===
  User: {
    galleries: (parent, _, { prisma }) =>
      prisma.gallery.findMany({ where: { userId: parent.id } }),
    adminLogs: (parent, _, { prisma }) =>
      prisma.adminActivityLog.findMany({ where: { adminId: parent.id } }),
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

  AdminActivityLog: {
    admin: (parent, _, { prisma }) =>
      prisma.user.findUnique({ where: { id: parent.adminId } }),
  },
}

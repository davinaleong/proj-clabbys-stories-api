import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { env } from "./../config/env.js"

export const resolvers = {
  Query: {
    users: async (_, __, { prisma }) => prisma.user.findMany(),

    user: async (_, { id }, { prisma }) =>
      prisma.user.findUnique({ where: { id } }),

    galleries: async (_, { userId }, { prisma }) => {
      if (userId) {
        return prisma.gallery.findMany({ where: { userId } })
      }
      return prisma.gallery.findMany() // all galleries for admin
    },

    gallery: async (_, { id }, { prisma }) =>
      prisma.gallery.findUnique({ where: { id } }),

    // ❌ REMOVED insecure plaintext search
    // galleryByPassphrase: async (_, { passphrase }, { prisma }) => { ... }

    photos: async (_, { galleryId }, { prisma }) =>
      prisma.photo.findMany({ where: { galleryId } }),

    adminActivityLogs: async (_, __, { prisma }) =>
      prisma.adminActivityLog.findMany(),

    couples: async (_, __, { prisma }) =>
      prisma.user.findMany({ where: { role: "COUPLE" } }),

    // ✅ Still allow guest token-based gallery access
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
    createUser: async (_, { data }, { prisma }) => prisma.user.create({ data }),

    createGallery: async (_, { data }, { prisma }) =>
      prisma.gallery.create({ data }),

    createPhoto: async (_, { data }, { prisma }) =>
      prisma.photo.create({ data }),

    publishGallery: async (_, { id }, { prisma }) =>
      prisma.gallery.update({
        where: { id },
        data: { isPublished: true },
      }),

    logAdminAction: async (_, { adminId, action, details }, { prisma }) =>
      prisma.adminActivityLog.create({
        data: { adminId, action, details },
      }),

    // ❌ REMOVED insecure unlockGallery with plaintext passphrase

    // ✅ 1. Set a hashed passphrase (only allowed if none exists yet)
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

    // ✅ 2. Login with passphrase → return JWT for couple editing
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

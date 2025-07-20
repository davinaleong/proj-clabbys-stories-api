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
    photos: (_, __, { prisma }) => prisma.photo.findMany(),
    galleryPhotos: (_, { galleryId }, { prisma }) =>
      prisma.photo.findMany({ where: { galleryId } }),

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
    createUser: (_, { data }, { prisma }) => prisma.user.create({ data }),

    // ✅ Gallery Mutations
    createGallery: async (_, { data }, { prisma }) => {
      const { title, description, date, userId, passphrase } = data

      let passphraseHash = null
      if (passphrase) {
        passphraseHash = await bcrypt.hash(passphrase, 10)
      }

      return prisma.gallery.create({
        data: {
          title,
          description,
          date,
          userId,
          passphraseHash,
        },
      })
    },

    updateGallery: async (_, { id, data }, { prisma }) => {
      let updateData = { ...data }

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
        data: { isPublished: true },
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
    createPhoto: (_, { data }, { prisma }) => prisma.photo.create({ data }),

    createPhotos: async (_, { data }, { prisma }) => {
      await prisma.photo.createMany({ data, skipDuplicates: true })
      return prisma.photo.findMany({
        orderBy: { createdAt: "desc" },
      })
    },

    // ✅ Assign existing photo to a gallery
    assignPhotoToGallery: async (_, { photoId, galleryId }, { prisma }) => {
      const gallery = await prisma.gallery.findUnique({
        where: { id: galleryId },
      })
      if (!gallery) throw new Error("Gallery not found")

      return prisma.photo.update({
        where: { id: photoId },
        data: { galleryId },
      })
    },

    updateAppSetting: async (_, { id, data }, { prisma }) => {
      if (!data.applicationName && !data.lightboxMode && !data.defaultSortOrder)
        throw new Error("No update fields provided")

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
      parent.galleryId
        ? prisma.gallery.findUnique({ where: { id: parent.galleryId } })
        : null,
  },
}

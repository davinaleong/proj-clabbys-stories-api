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

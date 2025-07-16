export const coupleResolvers = {
  Query: {
    couples: (_, __, { prisma }) => prisma.couple.findMany(),
    couple: (_, { id }, { prisma }) =>
      prisma.couple.findUnique({ where: { id } }),
  },
  Mutation: {
    createCouple: (_, { data }, { prisma }) => prisma.couple.create({ data }),
  },
  Couple: {
    galleries: (parent, _, { prisma }) =>
      prisma.gallery.findMany({ where: { coupleId: parent.id } }),
  },
}

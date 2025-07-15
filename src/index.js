import { ApolloServer } from "apollo-server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// 1️⃣ GraphQL Schema (SDL)
const typeDefs = `#graphql
  type Couple {
    id: ID!
    name: String!
    email: String!
    passphrase: String!
    galleries: [Gallery!]!
  }

  type Gallery {
    id: ID!
    title: String!
    couple: Couple!
    photos: [Photo!]!
  }

  type Photo {
    id: ID!
    title: String
    description: String
    imageUrl: String!
    thumbUrl: String
    takenAt: String
    gallery: Gallery!
  }

  type Query {
    couples: [Couple!]!
    couple(id: ID!): Couple
    galleries(coupleId: ID!): [Gallery!]!
    photos(galleryId: ID!): [Photo!]!
  }

  input CoupleInput {
    name: String!
    email: String!
    passphrase: String!
  }

  type Mutation {
    createCouple(data: CoupleInput!): Couple!
  }
`

// 2️⃣ Resolvers
const resolvers = {
  Query: {
    couples: () => prisma.couple.findMany(),
    couple: (_, args) => prisma.couple.findUnique({ where: { id: args.id } }),
    galleries: (_, args) =>
      prisma.gallery.findMany({ where: { coupleId: args.coupleId } }),
    photos: (_, args) =>
      prisma.photo.findMany({ where: { galleryId: args.galleryId } }),
  },
  Mutation: {
    createCouple: (_, { data }) => prisma.couple.create({ data }),
  },
  Couple: {
    galleries: (parent) =>
      prisma.gallery.findMany({ where: { coupleId: parent.id } }),
  },
  Gallery: {
    photos: (parent) =>
      prisma.photo.findMany({ where: { galleryId: parent.id } }),
    couple: (parent) =>
      prisma.couple.findUnique({ where: { id: parent.coupleId } }),
  },
  Photo: {
    gallery: (parent) =>
      prisma.gallery.findUnique({ where: { id: parent.galleryId } }),
  },
}

// 3️⃣ Start Server
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

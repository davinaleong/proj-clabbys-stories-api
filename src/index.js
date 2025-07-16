import { ApolloServer } from "apollo-server"
import { PrismaClient } from "@prisma/client"
import { typeDefs } from "./schema/typeDefs.js"
import { resolvers } from "./schema/resolvers.js"

const prisma = new PrismaClient()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ prisma }),
  introspection: true, // so Postman/Apollo Sandbox can fetch schema
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})

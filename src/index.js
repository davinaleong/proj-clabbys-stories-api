import { ApolloServer } from "apollo-server"
import { typeDefs, resolvers } from "./schema/index.js"
import { context } from "./context.js"

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
})

server.listen().then(({ url }) => {
  console.log(`🚀 API ready at ${url}`)
})

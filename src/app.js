import express from "express"
import cors from "cors"
import { ApolloServer } from "apollo-server-express"
import { PrismaClient } from "@prisma/client"
import { env } from "./config/env.js"
import { allowedOrigins } from "./config/allowed-origins.js"
import uploadRoute from "./routes/upload.js" // REST upload route
import { typeDefs } from "./schema/typeDefs.js"
import { resolvers } from "./schema/resolvers.js"

const prisma = new PrismaClient()
const app = express()

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked: ${origin}`))
      }
    },
    credentials: true,
  })
)

app.use(express.json())

// ✅ Apollo Server setup
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ prisma, req, res }),
    introspection: env.INTROSPECTION, // allow schema introspection for tools like Postman
  })

  // Start Apollo Server
  await server.start()

  // Apply Apollo middleware to Express
  server.applyMiddleware({ app, path: "/graphql", cors: false })

  // ✅ REST Upload Route (multer + Cloudinary)
  app.use("/api/upload", uploadRoute)

  // ✅ Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" })
  })

  // ✅ Start Express server
  const PORT = env.PORT || 4000
  app.listen(PORT, () => {
    console.log(`✅ REST API ready at http://localhost:${PORT}`)
    console.log(
      `🚀 GraphQL API ready at http://localhost:${PORT}${server.graphqlPath}`
    )
  })
}

startApolloServer()

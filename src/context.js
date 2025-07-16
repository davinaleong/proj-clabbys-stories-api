import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export const context = ({ req }) => {
  // later: parse JWT auth token if needed
  return { prisma }
}

import { gql } from "apollo-server-express"

export const typeDefs = gql`
  # ==============================
  # ✅ QUERIES
  # ==============================
  type Query {
    # Users
    users: [User!]!
    user(id: ID!): User

    # Galleries
    galleries(userId: ID): [Gallery!]!
    gallery(id: ID!): Gallery
    guestGallery(token: String!): Gallery

    # Photos
    photos(galleryId: ID!): [Photo!]!

    # Admin
    adminActivityLogs: [AdminActivityLog!]!
    couples: [User!]!
  }

  # ==============================
  # ✅ MUTATIONS
  # ==============================
  type Mutation {
    # Users
    createUser(data: CreateUserInput!): User!

    # Galleries
    createGallery(data: CreateGalleryInput!): Gallery!
    publishGallery(id: ID!): Gallery!

    # ✅ Secure Passphrase Auth
    setGalleryPassphrase(id: ID!, passphrase: String!): Boolean!
    loginGallery(id: ID!, passphrase: String!): AuthPayload!

    # Photos
    createPhoto(data: CreatePhotoInput!): Photo!
    createPhotos(data: CreatePhotoBatchInput!): [Photo!]!

    # Admin Logs
    logAdminAction(
      adminId: ID!
      action: String!
      details: String
    ): AdminActivityLog!
  }

  # ==============================
  # ✅ SECURE LOGIN RETURN
  # ==============================
  type AuthPayload {
    token: String!
    gallery: Gallery!
  }

  # ==============================
  # ✅ CORE TYPES
  # ==============================
  type Gallery {
    id: ID!
    title: String
    description: String
    isPublished: Boolean
    userId: String
    owner: User
    photos: [Photo!]
    createdAt: String
    updatedAt: String
  }

  type Photo {
    id: ID!
    title: String
    description: String
    imageUrl: String!
    thumbUrl: String
    caption: String
    takenAt: String
    galleryId: String!
    gallery: Gallery
    createdAt: String
    updatedAt: String
  }

  input CreatePhotoBatchInput {
    galleryId: String!
    photos: [CreatePhotoInput!]!
  }

  type User {
    id: ID!
    email: String!
    role: String!
    galleries: [Gallery!]
    adminLogs: [AdminActivityLog!]
  }

  type AdminActivityLog {
    id: ID!
    adminId: String!
    action: String!
    details: String
    createdAt: String!
    admin: User
  }

  # ==============================
  # ✅ INPUT TYPES
  # ==============================
  input CreateUserInput {
    email: String!
    password: String!
    role: String! # ADMIN, COUPLE
  }

  input CreateGalleryInput {
    title: String!
    description: String
    userId: String!
  }

  input CreatePhotoInput {
    title: String
    description: String
    imageUrl: String!
    thumbUrl: String
    caption: String
    takenAt: String
    galleryId: String!
  }
`

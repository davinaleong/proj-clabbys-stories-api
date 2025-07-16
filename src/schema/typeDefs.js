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
    galleryByPassphrase(passphrase: String!): Gallery
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
    unlockGallery(passphrase: String!): UnlockGalleryResponse!

    # Photos
    createPhoto(data: CreatePhotoInput!): Photo!

    # Admin Logs
    logAdminAction(
      adminId: ID!
      action: String!
      details: String
    ): AdminActivityLog!
  }

  # ==============================
  # ✅ CUSTOM RETURN TYPES
  # ==============================
  type UnlockGalleryResponse {
    gallery: Gallery!
    token: String!
  }

  # ==============================
  # ✅ CORE TYPES
  # ==============================
  type Gallery {
    id: ID!
    title: String
    description: String
    passphrase: String
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
    role: String! # e.g. ADMIN, COUPLE, GUEST
  }

  input CreateGalleryInput {
    title: String!
    description: String
    passphrase: String
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

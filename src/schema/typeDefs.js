export const typeDefs = `#graphql
  enum UserRole {
    COUPLE
    ADMIN
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    galleries: [Gallery!]!
    adminLogs: [AdminActivityLog!]!
    createdAt: String!
    updatedAt: String!
  }

  type Gallery {
    id: ID!
    title: String!
    description: String
    passphrase: String
    owner: User!
    photos: [Photo!]!
    isPublished: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Photo {
    id: ID!
    title: String
    description: String
    imageUrl: String!
    thumbUrl: String
    takenAt: String
    gallery: Gallery!
    createdAt: String!
    updatedAt: String!
  }

  type AdminActivityLog {
    id: ID!
    action: String!
    details: String
    admin: User!
    createdAt: String!
  }

  # ✅ Response type for unlockGallery
  type UnlockGalleryPayload {
    gallery: Gallery!
    token: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    role: UserRole!
  }

  input GalleryInput {
    title: String!
    description: String
    passphrase: String
    userId: ID!
    isPublished: Boolean
  }

  input PhotoInput {
    galleryId: ID!
    title: String
    description: String
    imageUrl: String!
    thumbUrl: String
    takenAt: String
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    couples: [User!]!

    galleries(userId: ID): [Gallery!]!
    gallery(id: ID!): Gallery
    galleryByPassphrase(passphrase: String!): Gallery

    photos(galleryId: ID!): [Photo!]!

    adminActivityLogs: [AdminActivityLog!]!
  }

  type Mutation {
    createUser(data: UserInput!): User!
    createGallery(data: GalleryInput!): Gallery!
    createPhoto(data: PhotoInput!): Photo!

    publishGallery(id: ID!): Gallery!
    logAdminAction(adminId: ID!, action: String!, details: String): AdminActivityLog!

    # ✅ New mutation to unlock a gallery with passphrase & return guest token
    unlockGallery(passphrase: String!): UnlockGalleryPayload!
  }
`

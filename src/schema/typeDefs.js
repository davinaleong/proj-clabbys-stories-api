import { gql } from "apollo-server-express"

export const typeDefs = gql`
  # ==============================
  # ✅ ENUMS
  # ==============================
  enum LightboxMode {
    BLACK
    BLURRED
  }

  enum SortOrder {
    ALPHABETICAL_ASC
    ALPHABETICAL_DESC
    NEWEST
    OLDEST
  }

  # ==============================
  # ✅ PAGINATION TYPES
  # ==============================
  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type GalleryEdge {
    cursor: String!
    node: Gallery!
  }

  type GalleryConnection {
    edges: [GalleryEdge!]!
    pageInfo: PageInfo!
  }

  type PhotoEdge {
    cursor: String!
    node: Photo!
  }

  type PhotoConnection {
    edges: [PhotoEdge!]!
    pageInfo: PageInfo!
  }

  # ==============================
  # ✅ QUERIES
  # ==============================
  type Query {
    # Users (couples only)
    users: [User!]!
    user(id: ID!): User

    # Galleries
    galleries(userId: ID): [Gallery!]!
    gallery(id: ID!): Gallery

    # ✅ Cursor-based Pagination
    galleriesPaginated(
      userId: ID
      after: String
      first: Int = 10
    ): GalleryConnection!

    # Photos
    photos(galleryId: ID!): [Photo!]!

    # ✅ Cursor-based Pagination for Photos
    photosPaginated(
      galleryId: ID!
      after: String
      first: Int = 10
    ): PhotoConnection!

    # App Settings
    appSettings: [AppSetting!]!
    appSetting(id: ID!): AppSetting
  }

  # ==============================
  # ✅ MUTATIONS
  # ==============================
  type Mutation {
    # Users (for couples)
    createUser(data: CreateUserInput!): User!

    # Galleries
    createGallery(data: CreateGalleryInput!): Gallery!
    publishGallery(id: ID!): Gallery!

    # ✅ Passphrase Authentication
    setGalleryPassphrase(id: ID!, passphrase: String!): Boolean!
    loginGallery(id: ID!, passphrase: String!): AuthPayload!

    # Photos
    createPhoto(data: CreatePhotoInput!): Photo!
    createPhotos(data: CreatePhotoBatchInput!): [Photo!]!

    # App Settings
    updateAppSetting(id: ID!, data: UpdateAppSettingInput!): AppSetting!
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
    title: String!
    description: String
    isPublished: Boolean
    passphraseHash: String # stored hashed passphrase (not exposed normally)
    userId: String!
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
    name: String!
    email: String!
    galleries: [Gallery!]
  }

  # ==============================
  # ✅ APP SETTINGS TYPE
  # ==============================
  type AppSetting {
    id: ID!
    applicationName: String!
    lightboxMode: LightboxMode!
    defaultSortOrder: SortOrder!
    createdAt: String!
    updatedAt: String!
  }

  # ==============================
  # ✅ INPUT TYPES
  # ==============================
  input CreateUserInput {
    name: String!
    email: String!
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

  input CreatePhotoBatchInput {
    galleryId: String!
    photos: [CreatePhotoInput!]!
  }

  input UpdateAppSettingInput {
    applicationName: String
    lightboxMode: LightboxMode
    defaultSortOrder: SortOrder
  }
`

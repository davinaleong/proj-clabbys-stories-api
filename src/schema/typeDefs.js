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
    # Users
    users: [User!]!
    user(id: ID!): User

    # Galleries
    galleries: [Gallery!]!
    gallery(id: ID!): Gallery
    galleriesPaginated(after: String, first: Int = 10): GalleryConnection!

    # Photos
    photos: [Photo!]! # All photos (unassigned + assigned)
    galleryPhotos(galleryId: ID!): [Photo!]!
    photosPaginated(after: String, first: Int = 10): PhotoConnection!

    # App Settings
    appSettings: [AppSetting!]!
    appSetting(id: ID!): AppSetting
  }

  # ==============================
  # ✅ MUTATIONS
  # ==============================
  type Mutation {
    # Users
    createUser(data: CreateUserInput!): User!

    # Galleries
    createGallery(data: CreateGalleryInput!): Gallery!
    updateGallery(id: ID!, data: UpdateGalleryInput!): Gallery!
    publishGallery(id: ID!): Gallery!

    # ✅ Gallery Password
    setGalleryPassphrase(id: ID!, passphrase: String!): Boolean!
    loginGallery(id: ID!, passphrase: String!): AuthPayload!

    # Photos
    createPhoto(data: CreatePhotoInput!): Photo!
    createPhotos(data: [CreatePhotoInput!]!): [Photo!]!
    assignPhotoToGallery(photoId: ID!, galleryId: ID!): Photo!

    # App Settings
    updateAppSetting(id: ID!, data: UpdateAppSettingInput!): AppSetting!
  }

  # ==============================
  # ✅ AUTH
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
    date: String
    isPublished: Boolean
    passphraseHash: String
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
    galleryId: String
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

  # ✅ Gallery Inputs
  input CreateGalleryInput {
    title: String!
    description: String
    date: String
    userId: String!
    passphrase: String
  }

  input UpdateGalleryInput {
    title: String
    description: String
    date: String
    passphrase: String
    isPublished: Boolean
  }

  # ✅ Photo Inputs
  input CreatePhotoInput {
    title: String
    description: String
    imageUrl: String!
    thumbUrl: String
    caption: String
    takenAt: String
  }

  input UpdateAppSettingInput {
    applicationName: String
    lightboxMode: LightboxMode
    defaultSortOrder: SortOrder
  }
`

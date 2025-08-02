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

  enum GalleryStatus {
    DRAFT
    PUBLISHED
    PUBLIC
  }

  enum DateFormat {
    EEE_D_MMM_YYYY # Sun, 20 Jul 2025
    EEEE_D_MMM_YYYY # Sunday, 20 Jul 2025
    EEEE_D_MMMM_YYYY # Sunday, 20 July 2025
    D_MMM_YYYY # 20 Jul 2025
    D_MMMM_YYYY # 20 July 2025
    D_MMM # 20 Jul
    D_MMMM # 20 July
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

  type EnumValues {
    name: String!
  }

  type EnumValuesResult {
    values: [EnumValues!]!
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
    galleriesPaginated(after: String, first: Int = 12): GalleryConnection!

    # Photos
    photos: [Photo!]!
    galleryPhotos(galleryId: ID!): [Photo!]!
    photosPaginated(after: String, first: Int = 12): PhotoConnection!

    # App Settings
    appSettings: [AppSetting!]!
    appSetting(id: ID!): AppSetting

    # App Settings Enum Values
    galleryStatusEnum: EnumValuesResult!
    lightboxModeEnum: EnumValuesResult!
    sortOrderEnum: EnumValuesResult!
    dateFormatEnum: EnumValuesResult!
  }

  # ==============================
  # ✅ MUTATIONS
  # ==============================
  type Mutation {
    # Users
    createUser(data: CreateUserInput!): User!
    registerUser(data: RegisterUserInput!): User!
    loginUser(email: String!, password: String!): UserAuthPayload!
    logoutUser: LogoutResponse!

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
    updatePhoto(id: ID!, data: UpdatePhotoInput!): Photo!

    # ✅ Photo ordering
    updatePhotoPosition(photoId: ID!, position: Int!): Photo!
    updatePhotoOrder(updates: [PhotoOrderUpdateInput!]!): [Photo!]!

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

  type UserAuthPayload {
    token: String!
    user: User!
  }

  type LogoutResponse {
    success: Boolean!
    message: String!
  }

  # ==============================
  # ✅ CORE TYPES
  # ==============================
  type Gallery {
    id: ID!
    title: String!
    description: String
    date: String
    status: GalleryStatus!
    passphrase: String
    passphraseHash: String
    photos: [Photo!]
    owner: User
    ownerId: String
    createdAt: String
    updatedAt: String
  }

  type Photo {
    id: ID!
    title: String
    description: String
    imageUrl: String!
    caption: String
    takenAt: String
    position: Int!
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
    defaultDateFormat: DateFormat!
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

  input RegisterUserInput {
    name: String!
    email: String!
    password: String!
  }

  # ✅ Gallery Inputs
  input CreateGalleryInput {
    title: String!
    description: String
    date: String
    passphrase: String
    status: GalleryStatus = DRAFT
  }

  input UpdateGalleryInput {
    title: String
    description: String
    date: String
    passphrase: String
    status: GalleryStatus
  }

  # ✅ Photo Inputs (must belong to a gallery)
  input CreatePhotoInput {
    galleryId: String!
    title: String
    description: String
    imageUrl: String!
    takenAt: String
    fileSize: Int # optional, for validation
  }

  input UpdatePhotoInput {
    galleryId: String # Optionally reassign to another gallery
    title: String
    description: String
    takenAt: String # ISO date string
    position: Int
  }

  # ✅ Batch photo order update
  input PhotoOrderUpdateInput {
    photoId: ID!
    position: Int!
  }

  input UpdateAppSettingInput {
    applicationName: String
    lightboxMode: LightboxMode
    defaultDateFormat: DateFormat
    defaultSortOrder: SortOrder
  }
`

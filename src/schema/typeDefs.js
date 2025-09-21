// typeDefs.js
import { gql } from "apollo-server-express"

export const typeDefs = gql`
  # ==============================
  # ✅ ENUMS
  # ==============================
  enum LightboxMode {
    BLACK
    BLURRED
    SLIDESHOW
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
    EEE_D_MMM_YYYY
    EEEE_D_MMM_YYYY
    EEEE_D_MMMM_YYYY
    D_MMM_YYYY
    D_MMMM_YYYY
    D_MMM
    D_MMMM
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
  # ✅ ENUM QUERY SUPPORT
  # ==============================
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

    # Archived Galleries
    archives: [Gallery!]!
    archive(id: ID!): Gallery
    archivesPaginated(after: String, first: Int = 12): GalleryConnection!

    # Photos
    photos: [Photo!]!
    photosPaginated(after: String, first: Int = 12): PhotoConnection!

    # App Settings
    appSettings: [AppSetting!]!
    appSetting(id: ID!): AppSetting

    # Enums
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
    createUser(data: UserInput!): User!
    registerUser(data: UserInput!): User!
    loginUser(email: String!, password: String!): UserAuthPayload!
    logoutUser: LogoutResponse!

    # Galleries
    createGallery(data: CreateGalleryInput!): Gallery!
    updateGallery(id: ID!, data: UpdateGalleryInput!): Gallery!
    archiveGallery(id: ID!): Gallery!
    restoreGallery(id: ID!): Gallery!
    deleteGallery(id: ID!): Gallery!

    # Gallery Password
    setGalleryPassphrase(id: ID!, passphrase: String!): Boolean!
    loginGallery(id: ID!, passphrase: String!): AuthPayload!
    verifyGalleryPin(id: ID!, pin: String!): VerifyGalleryPinResponse!

    # Photos
    createPhoto(data: CreatePhotoInput!): Photo!
    createPhotos(data: [CreatePhotoInput!]!): [Photo!]!
    assignPhotoToGallery(photoId: ID!, galleryId: ID!): Photo!
    updatePhoto(id: ID!, data: UpdatePhotoInput!): Photo!
    deletePhoto(id: ID!): Photo!
    movePhotoToGallery(photoId: ID!, toGalleryId: ID!): Photo!

    # Photo ordering
    updatePhotoPosition(photoId: ID!, position: Int!): Photo!
    updatePhotoOrder(updates: [PhotoOrderUpdateInput!]!): [Photo!]!

    # App Settings
    createAppSetting(data: CreateAppSettingInput!): AppSetting!
    updateAppSetting(id: ID!, data: UpdateAppSettingInput!): AppSetting!
  }

  # ==============================
  # ✅ AUTH TYPES
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

  type VerifyGalleryPinResponse {
    ok: Boolean!
    token: String
    message: String
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
    lightboxMode: LightboxMode! # ✅ NEW
    hasPassphrase: Boolean!
    photos: [Photo!]
    spotifyPlaylistUrl: String
    createdAt: String
    updatedAt: String
    deletedAt: String
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
    galleries: [Gallery!]!
  }

  # ==============================
  # ✅ APP SETTINGS TYPE
  # ==============================
  type AppSetting {
    id: ID!
    applicationName: String!
    defaultDateFormat: DateFormat!
    defaultSortOrder: SortOrder!
    createdAt: String!
    updatedAt: String!
  }

  # ==============================
  # ✅ INPUT TYPES
  # ==============================
  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  input CreateGalleryInput {
    title: String!
    description: String
    date: String
    passphrase: String
    status: GalleryStatus = DRAFT
    lightboxMode: LightboxMode = BLACK
    spotifyPlaylistUrl: String
  }

  input UpdateGalleryInput {
    title: String
    description: String
    date: String
    passphrase: String
    status: GalleryStatus
    lightboxMode: LightboxMode
    spotifyPlaylistUrl: String
  }

  input CreatePhotoInput {
    galleryId: String!
    title: String
    description: String
    imageUrl: String!
    takenAt: String
    fileSize: Int
  }

  input UpdatePhotoInput {
    galleryId: String
    title: String
    description: String
    takenAt: String
    position: Int
  }

  input PhotoOrderUpdateInput {
    photoId: ID!
    position: Int!
  }

  input CreateAppSettingInput {
    applicationName: String!
    defaultDateFormat: DateFormat!
    defaultSortOrder: SortOrder!
  }

  input UpdateAppSettingInput {
    applicationName: String
    defaultDateFormat: DateFormat
    defaultSortOrder: SortOrder
  }
`

export const typeDefs = `#graphql
  type Couple {
    id: ID!
    name: String!
    email: String!
    passphrase: String!
    galleries: [Gallery!]!
  }

  type Gallery {
    id: ID!
    title: String!
    couple: Couple!
    photos: [Photo!]!
  }

  type Photo {
    id: ID!
    title: String
    description: String
    imageUrl: String!
    thumbUrl: String
    takenAt: String
    gallery: Gallery!
  }

  type Query {
    couples: [Couple!]!
    couple(id: ID!): Couple
    galleries(coupleId: ID!): [Gallery!]!
    photos(galleryId: ID!): [Photo!]!
  }

  input CoupleInput {
    name: String!
    email: String!
    passphrase: String!
  }

  type Mutation {
    createCouple(data: CoupleInput!): Couple!
  }
`

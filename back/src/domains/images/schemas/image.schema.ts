import { gql } from 'apollo-server-express';

export const imageTypeDefs = gql`
  type Image {
    id: ID!
    filename: String!
    originalFilename: String!
    url: String!
    size: Int!
    width: Int!
    height: Int!
    mimeType: String!
    altText: String
    createdAt: String!
    updatedAt: String!
    metadata: JSON
  }

  enum ImageSize {
    THUMBNAIL
    MEDIUM
    FULL
  }

  enum ImageFormat {
    ORIGINAL
    WEBP
    JPEG
    PNG
  }

  type ImageUrl {
    url: String!
    size: ImageSize!
  }

  # JSON scalar for metadata
  scalar JSON

  type Query {
    # Get all images
    images: [Image!]!
    
    # Get specific image by ID
    image(id: ID!): Image
    
    # Get specific image by filename
    imageByFilename(filename: String!): Image
    
    # Get image URL with processing options (simplified)
    getImageUrl(
      filename: String!, 
      size: ImageSize
    ): ImageUrl
  }

  type Mutation {
    # Update image metadata (like alt text)
    updateImageMetadata(
      id: ID!, 
      altText: String
    ): Image
  }
`;

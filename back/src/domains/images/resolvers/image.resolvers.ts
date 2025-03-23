import { GraphQLScalarType } from 'graphql';
import { SERVER } from '../../../config/config';
import { Image, ImageFormat, ImageSize } from '../models/image.model';
import imageService from '../services/image.service';

// GraphQL resolvers
export const imageResolvers = {
  Query: {
    // Get all images
    images: async () => {
      return imageService.getAllImages();
    },
    
    // Get a single image by ID
    image: async (_: any, { id }: { id: string }) => {
      return imageService.getImageById(id);
    },
    
    // Get a single image by filename
    imageByFilename: async (_: any, { filename }: { filename: string }) => {
      return imageService.getImageByFilename(filename);
    },
    
    // Get image URL with processing options
    getImageUrl: async (
      _: any, 
      { 
        filename, 
        size = ImageSize.FULL
      }: { 
        filename: string; 
        size?: ImageSize;
      }
    ) => {
      const baseUrl = `${SERVER.API_PREFIX}/images/${filename}`;
      const params = new URLSearchParams();
      
      if (size !== ImageSize.FULL) {
        params.append('size', size);
      }
      
      const queryString = params.toString();
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      
      return {
        url,
        size
      };
    }
  },
  
  Mutation: {
    // Update image metadata
    updateImageMetadata: async (
      _: any, 
      { id, altText }: { id: string; altText?: string }
    ) => {
      return imageService.updateImageMetadata(id, { altText });
    }
  },
  
  // Custom scalar for JSON
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast: any) => ast.value
  })
}; 
import { Schema, type SchemaDefinition } from 'mongoose';
import { z } from 'zod';

/**
 * Converts a Zod schema to a Mongoose schema definition
 * @param zodSchema Zod schema to convert
 * @returns Mongoose schema definition
 */
export const zodToMongooseSchema = (zodSchema: z.ZodObject<any>): SchemaDefinition => {
  const shape = zodSchema.shape;
  const mongooseSchema: SchemaDefinition = {};

  for (const [key, value] of Object.entries(shape)) {
    if (value instanceof z.ZodString) {
      mongooseSchema[key] = {
        type: String,
        required: !value.isOptional(),
        ...(value._def.checks.length > 0 && {
          validate: {
            validator: (v: string) => {
              try {
                value.parse(v);
                return true;
              } catch {
                return false;
              }
            },
            message: value._def.checks[0].message || 'Validation failed',
          },
        }),
      };
    } else if (value instanceof z.ZodNumber) {
      mongooseSchema[key] = {
        type: Number,
        required: !value.isOptional(),
        ...(value._def.checks.length > 0 && {
          validate: {
            validator: (v: number) => {
              try {
                value.parse(v);
                return true;
              } catch {
                return false;
              }
            },
            message: value._def.checks[0].message || 'Validation failed',
          },
        }),
      };
    } else if (value instanceof z.ZodBoolean) {
      mongooseSchema[key] = {
        type: Boolean,
        required: !value.isOptional(),
      };
    } else if (value instanceof z.ZodArray) {
      mongooseSchema[key] = [zodToMongooseSchema(value.element as z.ZodObject<any>)];
    } else if (value instanceof z.ZodObject) {
      mongooseSchema[key] = zodToMongooseSchema(value);
    } else if (value instanceof z.ZodEnum) {
      mongooseSchema[key] = {
        type: String,
        required: !value.isOptional(),
        enum: value._def.values,
      };
    } else if (value instanceof z.ZodNativeEnum) {
      mongooseSchema[key] = {
        type: String,
        required: !value.isOptional(),
        enum: Object.values(value._def.values),
      };
    }
  }

  return mongooseSchema;
};

/**
 * Creates a Mongoose schema from a Zod schema
 * @param zodSchema Zod schema to convert
 * @returns Mongoose schema
 */
export const createMongooseSchema = (zodSchema: z.ZodObject<any>): Schema => {
  const mongooseSchemaDefinition = zodToMongooseSchema(zodSchema);
  return new Schema(mongooseSchemaDefinition, {
    timestamps: true,
    versionKey: 'version',
  });
};

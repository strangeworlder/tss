import { z } from 'zod';
import type { ZodType, ZodTypeDef } from 'zod';

/**
 * Type for Zod schema converter options
 */
export interface SchemaConverterOptions {
  /**
   * Whether to make all properties optional
   */
  makeOptional?: boolean;

  /**
   * Properties to exclude from the schema
   */
  exclude?: string[];

  /**
   * Properties to make required even if makeOptional is true
   */
  required?: string[];

  /**
   * Custom schema overrides for specific properties
   */
  overrides?: Record<string, ZodType<any, ZodTypeDef, any>>;
}

/**
 * Derives a Zod schema from a TypeScript type
 * @param baseSchema The base Zod schema to use as a template
 * @param options Configuration options for the derivation
 * @returns A new Zod schema
 */
export function deriveSchema<T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  options: SchemaConverterOptions = {}
): z.ZodObject<any> {
  const { makeOptional = false, exclude = [], required = [], overrides = {} } = options;

  // Create a new shape from the base schema
  const shape: Record<string, ZodType<any>> = {};

  // Process each property in the base schema
  for (const [key, value] of Object.entries(baseSchema.shape)) {
    // Skip excluded properties
    if (exclude.includes(key)) {
      continue;
    }

    // Use override schema if provided
    if (key in overrides) {
      shape[key] = overrides[key];
      continue;
    }

    // Make property optional if specified and not in required list
    if (makeOptional && !required.includes(key)) {
      shape[key] = value.optional();
    } else {
      shape[key] = value;
    }
  }

  return z.object(shape);
}

/**
 * Creates a response schema with success wrapper
 * @param dataSchema The schema for the data property
 * @returns A Zod schema for API responses
 */
export function createResponseSchema<T extends ZodType<any>>(dataSchema: T): z.ZodObject<any> {
  return z.object({
    success: z.boolean(),
    message: z.string().optional(),
    count: z.number().optional(),
    data: z.union([dataSchema, z.array(dataSchema)]).optional(),
    error: z.string().optional(),
  });
}

/**
 * Creates a schema for request validation
 * @param bodySchema Schema for request body
 * @param paramsSchema Schema for route parameters
 * @param querySchema Schema for query parameters
 * @returns A Zod schema for request validation
 */
export function createRequestSchema(
  bodySchema?: z.ZodType<any> | null,
  paramsSchema?: z.ZodType<any> | null,
  querySchema?: z.ZodType<any> | null
): z.ZodObject<any> {
  const schema: Record<string, ZodType<any>> = {};

  if (bodySchema) {
    schema.body = bodySchema;
  }

  if (paramsSchema) {
    schema.params = paramsSchema;
  }

  if (querySchema) {
    schema.query = querySchema;
  }

  return z.object(schema);
}

/**
 * Transforms an object by renaming properties
 * @param obj The object to transform
 * @param propMap The property mapping from old to new property names
 * @returns Transformed object
 */
export function transformObject<T extends Record<string, any>>(
  obj: T,
  propMap: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = { ...obj };

  for (const [oldKey, newKey] of Object.entries(propMap)) {
    if (oldKey in result) {
      result[newKey] = result[oldKey];
      delete result[oldKey];
    }
  }

  return result;
}

/**
 * Creates a schema transformation utility for converting between API and model formats
 * @param inputSchema The input schema
 * @param outputSchema The output schema
 * @param propMap Property mapping for transformation
 * @returns A function that transforms data between schemas
 */
export function createSchemaTransformer<TInput, TOutput>(
  inputSchema: z.ZodType<TInput>,
  outputSchema: z.ZodType<TOutput>,
  propMap: Record<string, string> = {}
): (input: TInput) => TOutput {
  return (input: TInput) => {
    // Validate input against input schema
    inputSchema.parse(input);

    // Transform object properties
    const transformed = transformObject(input as Record<string, any>, propMap);

    // Validate and return the transformed object
    return outputSchema.parse(transformed);
  };
}

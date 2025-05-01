import { type Model, type Document, Schema, model } from 'mongoose';
import type { z } from 'zod';
import { createMongooseSchema } from '../validation/utils/schemaTransform';

export abstract class BaseModel<T extends z.ZodObject<any>> {
  protected schema: T;
  protected mongooseModel: Model<z.infer<T> & Document>;

  constructor(schema: T, modelName: string) {
    this.schema = schema;
    const mongooseSchema = createMongooseSchema(schema);
    this.mongooseModel = model<z.infer<T> & Document>(modelName, mongooseSchema);
  }

  /**
   * Validates data against the Zod schema
   * @param data Data to validate
   * @returns Validated data
   * @throws Error if validation fails
   */
  protected validate(data: unknown): z.infer<T> {
    return this.schema.parse(data);
  }

  /**
   * Creates a new document
   * @param data Data to create document with
   * @returns Created document
   */
  async create(data: unknown): Promise<Document> {
    const validatedData = this.validate(data);
    return this.mongooseModel.create(validatedData);
  }

  /**
   * Finds a document by ID
   * @param id Document ID
   * @returns Found document or null
   */
  async findById(id: string): Promise<Document | null> {
    return this.mongooseModel.findById(id);
  }

  /**
   * Updates a document by ID
   * @param id Document ID
   * @param data Data to update
   * @returns Updated document or null
   */
  async updateById(id: string, data: unknown): Promise<Document | null> {
    const validatedData = this.validate(data);
    return this.mongooseModel.findByIdAndUpdate(id, { $set: validatedData }, { new: true });
  }

  /**
   * Deletes a document by ID
   * @param id Document ID
   * @returns Deleted document or null
   */
  async deleteById(id: string): Promise<Document | null> {
    return this.mongooseModel.findByIdAndDelete(id);
  }

  /**
   * Finds documents matching query
   * @param query Query object
   * @returns Array of matching documents
   */
  async find(query: Record<string, any> = {}): Promise<Document[]> {
    return this.mongooseModel.find(query);
  }

  /**
   * Counts documents matching query
   * @param query Query object
   * @returns Number of matching documents
   */
  async count(query: Record<string, any> = {}): Promise<number> {
    return this.mongooseModel.countDocuments(query);
  }
}

import { describe, it, expect } from '@jest/globals';
import { validateInput } from '../../utils/validation';
import type { CreateCommentInput } from '../../types/comment';
import { CommentParentTypeEnum } from '../../types/comment';

describe('Input Validation', () => {
  describe('Comment Input Validation', () => {
    it('should validate valid comment input', () => {
      const input: CreateCommentInput = {
        content: 'Valid comment content',
        parentId: '123',
        parentType: CommentParentTypeEnum.POST,
      };

      const result = validateInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty content', () => {
      const input: CreateCommentInput = {
        content: '',
        parentId: '123',
        parentType: CommentParentTypeEnum.POST,
      };

      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content is required');
    });

    it('should reject content with only whitespace', () => {
      const input: CreateCommentInput = {
        content: '   ',
        parentId: '123',
        parentType: CommentParentTypeEnum.POST,
      };

      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content cannot be empty');
    });

    it('should reject content exceeding maximum length', () => {
      const input: CreateCommentInput = {
        content: 'a'.repeat(1001),
        parentId: '123',
        parentType: CommentParentTypeEnum.POST,
      };

      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content exceeds maximum length of 1000 characters');
    });

    it('should reject invalid parent ID', () => {
      const input: CreateCommentInput = {
        content: 'Valid comment',
        parentId: '',
        parentType: CommentParentTypeEnum.POST,
      };

      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Parent ID is required');
    });

    it('should reject invalid parent type', () => {
      const input: CreateCommentInput = {
        content: 'Valid comment',
        parentId: '123',
        parentType: 'invalid' as CommentParentTypeEnum,
      };

      const result = validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid parent type');
    });
  });
});

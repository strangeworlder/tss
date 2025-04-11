import type { CreateCommentInput } from '@/types/comment';
import { CommentParentTypeEnum } from '@/types/comment';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateInput(input: CreateCommentInput): ValidationResult {
  const errors: string[] = [];

  if (!input.content) {
    errors.push('Content is required');
  } else if (input.content.trim().length === 0) {
    errors.push('Content cannot be empty');
  } else if (input.content.length > 1000) {
    errors.push('Content exceeds maximum length of 1000 characters');
  }

  if (!input.parentId) {
    errors.push('Parent ID is required');
  }

  if (!input.parentType || !Object.values(CommentParentTypeEnum).includes(input.parentType)) {
    errors.push('Invalid parent type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

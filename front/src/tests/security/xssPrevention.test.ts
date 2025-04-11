import { describe, it, expect } from 'vitest';
import type { IScheduledContent } from '@/types/content';
import { ScheduledContentStatusEnum } from '@/types/scheduling';
import { sanitizeInput } from '@/utils/security';

describe('XSS Prevention', () => {
  describe('Content Sanitization', () => {
    it('should sanitize HTML content', () => {
      const input = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('<p>Safe content</p>');
    });

    it('should allow safe HTML tags', () => {
      const input = '<p>Safe <strong>content</strong> with <em>formatting</em></p>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe(input);
    });

    it('should remove unsafe attributes', () => {
      const input = '<p onclick="alert(\'xss\')" style="color: red">Content</p>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('<p>Content</p>');
    });
  });

  describe('Scheduled Content Sanitization', () => {
    it('should sanitize content before scheduling', () => {
      const content: IScheduledContent = {
        id: '123',
        title: 'Test Title',
        content: '<script>alert("xss")</script><p>Safe content</p>',
        publishAt: new Date(),
        status: ScheduledContentStatusEnum.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'user123',
      };

      const sanitizedContent = {
        ...content,
        content: sanitizeInput(content.content),
      };

      expect(sanitizedContent.content).toBe('<p>Safe content</p>');
    });

    it('should preserve safe HTML in scheduled content', () => {
      const content: IScheduledContent = {
        id: '123',
        title: 'Test Title',
        content: '<p>Safe <strong>content</strong> with <em>formatting</em></p>',
        publishAt: new Date(),
        status: ScheduledContentStatusEnum.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'user123',
      };

      const sanitizedContent = {
        ...content,
        content: sanitizeInput(content.content),
      };

      expect(sanitizedContent.content).toBe(content.content);
    });
  });
});

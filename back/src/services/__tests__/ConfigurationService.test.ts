import { describe, it, expect, beforeEach, vi } from 'vitest';
import ConfigurationService from '../ConfigurationService';
import { ConfigurationModel } from '../../models/ConfigurationModel';

vi.mock('../../models/ConfigurationModel');

describe('ConfigurationService', () => {
  const mockUserId = 'test-user-id';
  const mockContentId = 'test-content-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGlobalDelay', () => {
    it('should return global delay settings', async () => {
      const mockSettings = {
        delayHours: 24,
        updatedBy: 'admin',
        updatedAt: new Date(),
      };

      vi.mocked(ConfigurationModel.findOne).mockResolvedValueOnce({
        value: mockSettings,
      } as any);

      const result = await ConfigurationService.getGlobalDelay();
      expect(result).toEqual(mockSettings);
    });

    it('should throw error when settings not found', async () => {
      vi.mocked(ConfigurationModel.findOne).mockResolvedValueOnce(null);

      await expect(ConfigurationService.getGlobalDelay()).rejects.toThrow(
        'Global delay settings not found'
      );
    });
  });

  describe('updateGlobalDelay', () => {
    it('should update global delay settings', async () => {
      const mockSettings = {
        delayHours: 48,
        updatedBy: mockUserId,
        updatedAt: expect.any(Date),
      };

      vi.mocked(ConfigurationModel.findOneAndUpdate).mockResolvedValueOnce({
        value: mockSettings,
      } as any);

      const result = await ConfigurationService.updateGlobalDelay(48, mockUserId);
      expect(result).toEqual(mockSettings);
    });

    it('should throw error for negative delay hours', async () => {
      await expect(ConfigurationService.updateGlobalDelay(-1, mockUserId)).rejects.toThrow(
        'Delay hours must be a positive number'
      );
    });
  });

  describe('getContentOverride', () => {
    it('should return content override when exists', async () => {
      const mockOverride = {
        contentId: mockContentId,
        delayHours: 12,
        reason: 'Testing',
        createdBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(ConfigurationModel.findOne).mockResolvedValueOnce({
        value: mockOverride,
      } as any);

      const result = await ConfigurationService.getContentOverride(mockContentId);
      expect(result).toEqual(mockOverride);
    });

    it('should return null when override not found', async () => {
      vi.mocked(ConfigurationModel.findOne).mockResolvedValueOnce(null);

      const result = await ConfigurationService.getContentOverride(mockContentId);
      expect(result).toBeNull();
    });
  });

  describe('createContentOverride', () => {
    it('should create content override', async () => {
      const mockOverride = {
        contentId: mockContentId,
        delayHours: 12,
        reason: 'Testing',
        createdBy: mockUserId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      vi.mocked(ConfigurationModel.findOneAndUpdate).mockResolvedValueOnce({
        value: mockOverride,
      } as any);

      const result = await ConfigurationService.createContentOverride(
        mockContentId,
        12,
        'Testing',
        mockUserId
      );
      expect(result).toEqual(mockOverride);
    });

    it('should throw error for negative delay hours', async () => {
      await expect(
        ConfigurationService.createContentOverride(mockContentId, -1, 'Testing', mockUserId)
      ).rejects.toThrow('Delay hours must be a positive number');
    });
  });

  describe('removeContentOverride', () => {
    it('should remove content override', async () => {
      vi.mocked(ConfigurationModel.deleteOne).mockResolvedValueOnce({} as any);

      await expect(
        ConfigurationService.removeContentOverride(mockContentId)
      ).resolves.not.toThrow();
    });
  });
});

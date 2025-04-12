import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import ConfigurationServiceInstance from '../ConfigurationService';
import { ConfigurationModel } from '../../models/ConfigurationModel';
import { Types } from 'mongoose';

// Mock ConfigurationModel
jest.mock('../../models/ConfigurationModel', () => ({
  ConfigurationModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

describe('ConfigurationService', () => {
  const mockUserId = new Types.ObjectId().toString();
  const mockContentId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGlobalDelay', () => {
    it('should return global delay settings', async () => {
      const mockSettings = {
        postDelayHours: 24,
        commentDelayHours: 12,
        updatedBy: 'admin',
        updatedAt: new Date(),
      };

      jest.mocked(ConfigurationModel.findOne).mockResolvedValueOnce({
        value: mockSettings,
      } as any);

      const result = await ConfigurationServiceInstance.getGlobalDelay();
      expect(result).toEqual(mockSettings);
    });

    it('should throw error when settings not found', async () => {
      jest.mocked(ConfigurationModel.findOne).mockResolvedValueOnce(null);

      await expect(ConfigurationServiceInstance.getGlobalDelay()).rejects.toThrow(
        'Global delay settings not found'
      );
    });
  });

  describe('updateGlobalDelay', () => {
    it('should update global delay settings', async () => {
      const mockSettings = {
        postDelayHours: 48,
        commentDelayHours: 24,
        updatedBy: mockUserId,
        updatedAt: expect.any(Date),
      };

      jest.mocked(ConfigurationModel.findOneAndUpdate).mockResolvedValueOnce({
        value: mockSettings,
      } as any);

      const result = await ConfigurationServiceInstance.updateGlobalDelay(48, 24, mockUserId);
      expect(result).toEqual(mockSettings);
    });

    it('should throw error for negative delay hours', async () => {
      await expect(
        ConfigurationServiceInstance.updateGlobalDelay(-1, -1, mockUserId)
      ).rejects.toThrow('Delay hours must be a positive number');
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

      jest.mocked(ConfigurationModel.findOne).mockResolvedValueOnce({
        value: mockOverride,
      } as any);

      const result = await ConfigurationServiceInstance.getContentOverride(mockContentId);
      expect(result).toEqual(mockOverride);
    });

    it('should return null when override not found', async () => {
      jest.mocked(ConfigurationModel.findOne).mockResolvedValueOnce(null);

      const result = await ConfigurationServiceInstance.getContentOverride(mockContentId);
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

      jest.mocked(ConfigurationModel.findOneAndUpdate).mockResolvedValueOnce({
        value: mockOverride,
      } as any);

      const result = await ConfigurationServiceInstance.createContentOverride(
        mockContentId,
        12,
        'Testing',
        mockUserId
      );
      expect(result).toEqual(mockOverride);
    });

    it('should throw error for negative delay hours', async () => {
      await expect(
        ConfigurationServiceInstance.createContentOverride(mockContentId, -1, 'Testing', mockUserId)
      ).rejects.toThrow('Delay hours must be a positive number');
    });
  });

  describe('removeContentOverride', () => {
    it('should remove content override', async () => {
      jest.mocked(ConfigurationModel.deleteOne).mockResolvedValueOnce({} as any);

      await expect(
        ConfigurationServiceInstance.removeContentOverride(mockContentId)
      ).resolves.not.toThrow();
    });
  });
});

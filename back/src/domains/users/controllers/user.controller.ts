import { Request, Response } from 'express';
import User from '../models/user.model';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { IUser } from '../models/user.model';

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, bio } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find user and update
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(bio && { bio })
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Construct the full avatar URL if avatar exists
    const avatarUrl = user.avatar?.filename ? `/uploads/images/${user.avatar.filename}` : null;

    // Return updated user data with full avatar URL
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar ? {
          url: avatarUrl,
          filename: user.avatar.filename,
          altText: user.avatar.altText
        } : null
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user avatar
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the user to get their name for the alt text
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      // Clean up the uploaded file if user not found
      fs.unlinkSync(file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Process the image with Sharp
    const filename = `avatar-${userId}-${Date.now()}.webp`;
    const outputPath = path.join(__dirname, '../../../../public/uploads/images', filename);

    try {
      await sharp(file.path)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 90 })
        .toFile(outputPath);

      // Delete the original uploaded file
      fs.unlinkSync(file.path);

      // Update user with new avatar in a single operation
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            avatar: {
              filename,
              altText: `${currentUser.firstName}'s avatar`
            }
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        // Clean up the processed file if update fails
        fs.unlinkSync(outputPath);
        return res.status(404).json({ message: 'User not found' });
      }

      // Construct the full avatar URL
      const avatarUrl = `/uploads/images/${filename}`;

      // Return updated user data with full avatar URL
      res.json({
        user: {
          id: updatedUser._id.toString(),
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          bio: updatedUser.bio,
          avatar: {
            url: avatarUrl,
            filename: updatedUser.avatar?.filename,
            altText: updatedUser.avatar?.altText
          }
        }
      });
    } catch (error) {
      // Clean up any files if processing fails
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      throw error;
    }
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({
      message: 'Error updating avatar',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export default {
  updateProfile,
  updateAvatar,
  getUsers
}; 
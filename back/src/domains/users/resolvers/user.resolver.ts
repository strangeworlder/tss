import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { UserResponse, type UserInput, type LoginInput } from '../schemas/user.schema';
import User, { IUser } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { JWT } from '../../../config/config';
import { redisClient } from '../../../db/redis/connection';
import { AuthMiddleware } from '../../../middlewares/graphql.middleware';

@Resolver()
export class UserResolver {
  // Get current user
  @Query(() => UserResponse, { nullable: true })
  @UseMiddleware(AuthMiddleware)
  async me(/* @Ctx() */ context: any): Promise<UserResponse | null> {
    try {
      const user = await User.findById(context.user.id);

      if (!user) {
        return null;
      }

      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
    } catch (error) {
      throw new Error('Failed to get user');
    }
  }

  // Register a new user
  @Mutation(() => UserResponse)
  async register(/* @Arg('input') */ input: UserInput): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create and save new user
      const user = new User({
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
      });

      await user.save();

      // Generate token
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT.SECRET, {
        expiresIn: JWT.EXPIRY,
      });

      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to register user');
    }
  }

  // Login user
  @Mutation(() => UserResponse)
  async login(/* @Arg('input') */ input: LoginInput): Promise<UserResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if password is correct
      const isMatch = await user.comparePassword(input.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT.SECRET, {
        expiresIn: JWT.EXPIRY,
      });

      // Store token in Redis
      await redisClient.set(`token:${user._id}`, token, {
        EX: 60 * 60 * 24, // 24 hours (in seconds)
      });

      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to login');
    }
  }
}

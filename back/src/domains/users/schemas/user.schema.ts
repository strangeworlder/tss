import { ObjectType, Field, ID, InputType } from 'type-graphql';
import { UserRole } from '../models/user.model';

// User Response
@ObjectType()
export class UserResponse {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  token?: string;
}

// User Input for Registration
@InputType()
export class UserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

// Login Input
@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
} 
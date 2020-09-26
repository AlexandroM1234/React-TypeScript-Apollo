import { User } from "src/entities/User";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";

@InputType()
// Username and password object for login validation register signup
class UsernamePasswordIput {
  @Field()
  username: string;
  @Field()
  password: string;
}
// Error object that if an error appears will respond with what field the error was in and a message of what was wrong with it
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

// UserResponse object that returns an error if there is one and if there isn't returns the user
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field()
  user?: User;
}

@Resolver()
export class UserResolver {
  // Register Mutation returns a User type
  @Mutation(() => User)
  async register(
    // Expects and options object that has a username and password
    @Arg("options") options: UsernamePasswordIput,
    @Ctx() { em }: MyContext
  ) {
    // password gets hashed using argon2
    const hashedPassword = await argon2.hash(options.password);
    // user is created in the database and returned on a successful creation
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }

  // Login mutation that can return a user if login is successful or an array of errors which have what field was wrong and a message of what was wrong with it
  @Mutation(() => UserResponse)
  async login(
    // takes in the same options as register
    @Arg("options") options: UsernamePasswordIput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // if a user is not found error field is returned
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username does not exist ",
          },
        ],
      };
    }
    // Once user is found the password is validated
    const valid = await argon2.verify(user.password, options.password);
    // if the password is invalid error is thrown
    if (!valid) {
      return {
        errors: [{ field: "password", message: "password was incorrect" }],
      };
    }
    // if the password is correct the user is returned
    return { user };
  }
}

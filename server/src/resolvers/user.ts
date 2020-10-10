import { User } from "src/entities/User";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "src/constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "src/utils/validateRegister";
import { sendEmail } from "src/utils/sendEmail";
import { v4 } from "uuid";
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

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
    if (!user) {
      // user doesn't exist
      return false;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // up to 3 days to change password

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}"> reset password </a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session!.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session!.userId });
    return user;
  }
  // Register Mutation returns a User type
  @Mutation(() => UserResponse)
  async register(
    // Expects and options object that has a username and password
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    // password gets hashed using argon2
    const hashedPassword = await argon2.hash(options.password);
    // user is created in the database and returned on a successful creation
    let user;
    // trys to register a new user
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          email: options.email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result[0];
    } catch (er) {
      //  if a user already has that username throws an error
      if (er.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "that username is already taken",
            },
          ],
        };
      }
    }
    // store user id in session
    // this will set a cookie for a user
    // auto login in user
    req.session!.userId = user.id;

    // if everything else works return the user object
    return { user };
  }

  // Login mutation that can return a user if login is successful or an array of errors which have what field was wrong and a message of what was wrong with it
  @Mutation(() => UserResponse)
  async login(
    // takes in the same options as register
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // if a user is not found error field is returned
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username does not exist ",
          },
        ],
      };
    }
    // Once user is found the password is validated
    const valid = await argon2.verify(user.password, password);
    // if the password is invalid error is thrown
    if (!valid) {
      return {
        errors: [{ field: "password", message: "password was incorrect" }],
      };
    }

    req.session!.userId = user.id;
    // if the password is correct the user is returned
    return { user };
  }
  // Logout functionality
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session!.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
